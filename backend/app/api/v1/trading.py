import datetime
import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.rbac import get_current_user, RoleName
from app.models.challenge import Challenge, ChallengeRule, ChallengePurchase, PurchaseStatus
from app.models.trading import Trade, DailySnapshot, BreachLog
from app.models.user import User
from app.services.risk_engine import risk_engine
from app.services.copy_engine import copy_engine
from app.schemas.trading import (
    AccountMetricsSchema,
    TradeSchema,
    DailySnapshotSchema,
    SimulateTradeRequest,
)

router = APIRouter()


def _compute_metrics(purchase: ChallengePurchase, challenge: Challenge, rules: ChallengeRule) -> AccountMetricsSchema:
    current_eq = float(purchase.current_equity)
    current_bal = float(purchase.current_balance)
    starting_bal = float(challenge.starting_balance)
    daily_ref = float(purchase.daily_starting_equity or challenge.starting_balance)

    # Daily Loss Limit Floor & Remaining
    max_daily_loss_pct = float(rules.max_daily_loss_percentage)
    daily_loss_allowance = daily_ref * (max_daily_loss_pct / 100.0)
    daily_floor = daily_ref - daily_loss_allowance
    daily_remaining_usd = max(0.0, current_eq - daily_floor)
    daily_remaining_pct = (daily_remaining_usd / daily_ref * 100.0) if daily_ref > 0 else 0.0

    # Max Drawdown Floor & Remaining
    max_dd_pct = float(rules.max_drawdown_percentage)
    if rules.drawdown_methodology == "TRAILING_EQUITY":
        hwm = float(purchase.high_water_mark or starting_bal)
        dd_floor = hwm - (hwm * (max_dd_pct / 100.0))
    else:
        # STATIC from initial starting balance
        dd_floor = starting_bal - (starting_bal * (max_dd_pct / 100.0))

    max_dd_remaining_usd = max(0.0, current_eq - dd_floor)
    max_dd_remaining_pct = (max_dd_remaining_usd / starting_bal * 100.0) if starting_bal > 0 else 0.0

    # Profit Target
    target_pct = float(rules.profit_target_percentage)
    target_amount = starting_bal * (1.0 + target_pct / 100.0)
    target_dist_usd = max(0.0, target_amount - current_eq)
    gain = max(0.0, current_eq - starting_bal)
    target_gain_needed = target_amount - starting_bal
    target_progress = min(100.0, (gain / target_gain_needed * 100.0)) if target_gain_needed > 0 else 0.0

    return AccountMetricsSchema(
        purchase_id=purchase.id,
        challenge_id=challenge.id,
        challenge_name=challenge.name,
        starting_balance=starting_bal,
        current_balance=current_bal,
        current_equity=current_eq,
        high_water_mark=float(purchase.high_water_mark),
        daily_starting_equity=daily_ref,
        status=purchase.status,
        mt5_login=purchase.mt5_login,
        mt5_server=purchase.mt5_server,
        mt5_password=purchase.mt5_password,
        mt5_investor_password=purchase.mt5_investor_password,
        leverage=rules.leverage,
        daily_loss_floor=round(daily_floor, 2),
        daily_loss_remaining_usd=round(daily_remaining_usd, 2),
        daily_loss_percent_remaining=round(daily_remaining_pct, 2),
        max_drawdown_floor=round(dd_floor, 2),
        max_drawdown_remaining_usd=round(max_dd_remaining_usd, 2),
        max_drawdown_percent_remaining=round(max_dd_remaining_pct, 2),
        profit_target_amount=round(target_amount, 2),
        profit_target_distance_usd=round(target_dist_usd, 2),
        profit_target_progress_percent=round(target_progress, 1),
        trading_days_completed=purchase.trading_days_count,
        trading_days_required=rules.min_trading_days,
        breached_reason=purchase.breached_reason,
        breached_at=purchase.breached_at,
        passed_at=purchase.passed_at,
    )


@router.get("/accounts", response_model=List[AccountMetricsSchema])
async def list_trading_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all trading evaluation accounts for the current user with live risk metrics."""
    stmt = (
        select(ChallengePurchase)
        .options(
            selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
        )
        .where(ChallengePurchase.user_id == current_user.id)
        .order_by(desc(ChallengePurchase.created_at))
    )
    res = await db.execute(stmt)
    purchases = res.scalars().all()

    results = []
    for p in purchases:
        if p.challenge and p.challenge.rules:
            results.append(_compute_metrics(p, p.challenge, p.challenge.rules))
    return results


@router.get("/accounts/{purchase_id}", response_model=AccountMetricsSchema)
async def get_account_metrics(
    purchase_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns detailed risk engine metrics for a specific challenge trading account."""
    stmt = (
        select(ChallengePurchase)
        .options(
            selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
        )
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()

    if not purchase:
        raise HTTPException(status_code=404, detail="Trading account not found")

    if purchase.user_id != current_user.id and current_user.role != RoleName.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    return _compute_metrics(purchase, purchase.challenge, purchase.challenge.rules)


@router.get("/accounts/{purchase_id}/trades", response_model=List[TradeSchema])
async def get_account_trades(
    purchase_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns trade history for an account."""
    # Verify access
    p_stmt = select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
    p_res = await db.execute(p_stmt)
    purchase = p_res.scalar_one_or_none()
    if not purchase:
        raise HTTPException(status_code=404, detail="Account not found")
    if purchase.user_id != current_user.id and current_user.role != RoleName.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    t_stmt = (
        select(Trade)
        .where(Trade.purchase_id == purchase_id)
        .order_by(desc(Trade.open_time))
        .limit(limit)
    )
    res = await db.execute(t_stmt)
    trades = res.scalars().all()
    return trades


@router.get("/accounts/{purchase_id}/snapshots", response_model=List[DailySnapshotSchema])
async def get_account_snapshots(
    purchase_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns daily equity snapshots for charting the performance curve."""
    # Verify access
    p_stmt = select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
    p_res = await db.execute(p_stmt)
    purchase = p_res.scalar_one_or_none()
    if not purchase:
        raise HTTPException(status_code=404, detail="Account not found")
    if purchase.user_id != current_user.id and current_user.role != RoleName.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    s_stmt = (
        select(DailySnapshot)
        .where(DailySnapshot.purchase_id == purchase_id)
        .order_by(DailySnapshot.snapshot_date.asc())
    )
    res = await db.execute(s_stmt)
    snapshots = res.scalars().all()
    return snapshots


@router.post("/accounts/{purchase_id}/simulate-trade", response_model=AccountMetricsSchema)
async def simulate_trade(
    purchase_id: str,
    payload: SimulateTradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Simulation endpoint to execute a trade and immediately run the Risk Engine.
    Useful for testing profit target, daily loss breach, and equity curve updates.
    """
    stmt = (
        select(ChallengePurchase)
        .options(
            selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
        )
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()

    if not purchase:
        raise HTTPException(status_code=404, detail="Account not found")
    if purchase.user_id != current_user.id and current_user.role != RoleName.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    profit_dec = Decimal(str(payload.profit))

    # Apply profit to account
    purchase.current_balance += profit_dec
    purchase.current_equity += profit_dec

    # Record trade
    now = datetime.datetime.now(datetime.timezone.utc)
    ticket_num = f"T{random_digits(8)}"
    trade = Trade(
        purchase_id=purchase.id,
        ticket=ticket_num,
        symbol=payload.symbol,
        trade_type=payload.trade_type,
        lots=Decimal(str(payload.lots)),
        open_price=Decimal(str(payload.open_price)),
        close_price=Decimal(str(payload.close_price)) if payload.close_price else None,
        open_time=now - datetime.timedelta(minutes=15),
        close_time=now if payload.is_closed else None,
        profit=profit_dec,
        status="CLOSED" if payload.is_closed else "OPEN",
    )
    db.add(trade)

    # Increment trading day count if not already counted today
    today = datetime.date.today()
    snap_stmt = select(DailySnapshot).where(
        DailySnapshot.purchase_id == purchase.id,
        DailySnapshot.snapshot_date == today,
    )
    snap_res = await db.execute(snap_stmt)
    snapshot = snap_res.scalar_one_or_none()

    if not snapshot:
        snapshot = DailySnapshot(
            purchase_id=purchase.id,
            snapshot_date=today,
            starting_balance=purchase.current_balance - profit_dec,
            starting_equity=purchase.current_equity - profit_dec,
            ending_balance=purchase.current_balance,
            ending_equity=purchase.current_equity,
            high_equity=purchase.current_equity,
            low_equity=purchase.current_equity,
            trades_count=1,
            daily_profit=profit_dec,
            is_trading_day=True,
        )
        purchase.trading_days_count += 1
        db.add(snapshot)
    else:
        if not snapshot.is_trading_day:
            snapshot.is_trading_day = True
            purchase.trading_days_count += 1
        snapshot.trades_count += 1
        snapshot.daily_profit += profit_dec
        snapshot.ending_balance = purchase.current_balance
        snapshot.ending_equity = purchase.current_equity
        if purchase.current_equity > snapshot.high_equity:
            snapshot.high_equity = purchase.current_equity
        if purchase.current_equity < snapshot.low_equity:
            snapshot.low_equity = purchase.current_equity

    # Trigger Risk Engine evaluation tick
    await risk_engine.evaluate_account(
        purchase=purchase,
        challenge=purchase.challenge,
        rules=purchase.challenge.rules,
        db=db,
    )

    # Update company-capital signal profile (non-blocking; isolated from retail evaluation)
    try:
        await copy_engine.evaluate_and_score_trader(purchase_id=purchase.id, db=db)
    except Exception:
        pass  # Signal scoring is best-effort; never block a trade

    await db.commit()
    await db.refresh(purchase)

    return _compute_metrics(purchase, purchase.challenge, purchase.challenge.rules)


def random_digits(length: int = 8) -> str:
    import random
    import string
    return "".join(random.choices(string.digits, k=length))
