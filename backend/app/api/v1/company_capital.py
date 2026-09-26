"""
Company Capital Admin API
=========================
Strictly isolated from retail trader evaluation accounts.

These endpoints manage:
  - Company broker accounts (live liquidity provider connections)
  - Signal leaderboard (top performing simulated trader signals)
  - Allocation strategies (company risk policies for shadow-copy)
  - Order execution journal (real trades made with company capital)

IMPORTANT: Company capital profits belong to the company reserve pool.
           They are NEVER automatically distributed as trader payouts.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal

from app.core.database import get_db
from app.core.rbac import get_current_user, RoleName, require_roles
from app.models.user import User
from app.models.company_capital import (
    CompanyBrokerAccount,
    TraderSignalProfile,
    CompanyAllocationStrategy,
    CompanyOrderExecution,
    AllocationStatus,
)
from app.schemas.company_capital import (
    BrokerAccountSchema,
    AdminCreateBrokerRequest,
    SignalProfileSchema,
    AllocationStrategySchema,
    AdminCreateStrategyRequest,
    AdminUpdateStrategyStatusRequest,
    OrderExecutionSchema,
    SignalLeaderboardEntry,
)
from app.services.copy_engine import copy_engine

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# BROKER ACCOUNTS
# ─────────────────────────────────────────────────────────────

@router.get(
    "/broker-accounts",
    response_model=List[BrokerAccountSchema],
    summary="List all company broker accounts",
)
async def list_broker_accounts(
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Returns all registered company capital broker accounts with live margin metrics."""
    stmt = select(CompanyBrokerAccount).order_by(desc(CompanyBrokerAccount.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/broker-accounts",
    response_model=BrokerAccountSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new company broker account",
)
async def create_broker_account(
    payload: AdminCreateBrokerRequest,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Super Admin only: Registers a new real broker account for company capital operations."""
    # Check uniqueness
    existing = (
        await db.execute(
            select(CompanyBrokerAccount).where(
                CompanyBrokerAccount.account_number == payload.account_number
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Account number already registered")

    account = CompanyBrokerAccount(
        broker_name=payload.broker_name,
        broker_type=payload.broker_type,
        account_number=payload.account_number,
        server_address=payload.server_address,
        currency=payload.currency,
        balance=payload.balance,
        equity=payload.balance,
        free_margin=payload.balance,
        margin_used=Decimal("0.00"),
        max_capital_allocation=payload.max_capital_allocation,
        current_allocation=Decimal("0.00"),
        api_credentials=payload.api_credentials,  # TODO: encrypt at rest in production
        is_active=True,
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.get(
    "/broker-accounts/{account_id}",
    response_model=BrokerAccountSchema,
    summary="Get a single broker account",
)
async def get_broker_account(
    account_id: str,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    account = (
        await db.execute(
            select(CompanyBrokerAccount).where(CompanyBrokerAccount.id == account_id)
        )
    ).scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail="Broker account not found")
    return account


# ─────────────────────────────────────────────────────────────
# SIGNAL LEADERBOARD
# ─────────────────────────────────────────────────────────────

@router.get(
    "/leaderboard",
    response_model=List[SignalLeaderboardEntry],
    summary="Top trader signal leaderboard",
)
async def get_signal_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    eligible_only: bool = Query(False, description="Return only copy-eligible accounts"),
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the top simulated trader accounts ranked by signal score.
    These scores are used internally to decide which accounts are eligible
    for company-capital shadow copying. This does NOT trigger any payouts.
    """
    stmt = select(TraderSignalProfile).order_by(
        desc(TraderSignalProfile.signal_score)
    ).limit(limit)
    if eligible_only:
        stmt = stmt.where(TraderSignalProfile.is_eligible_for_copy == True)

    result = await db.execute(stmt)
    profiles = result.scalars().all()

    return [
        SignalLeaderboardEntry(
            rank=idx + 1,
            purchase_id=p.purchase_id,
            user_id=p.user_id,
            signal_score=p.signal_score,
            win_rate_percentage=p.win_rate_percentage,
            profit_factor=p.profit_factor,
            consistency_rating=p.consistency_rating,
            is_eligible_for_copy=p.is_eligible_for_copy,
            total_trades_analyzed=p.total_trades_analyzed,
        )
        for idx, p in enumerate(profiles)
    ]


@router.post(
    "/score/{purchase_id}",
    response_model=SignalProfileSchema,
    summary="Manually trigger signal score recalculation",
)
async def recalculate_signal_score(
    purchase_id: str,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually triggers a signal quality score recalculation for a given purchase account.
    Normally this is triggered automatically after each simulated trade.
    """
    try:
        profile = await copy_engine.evaluate_and_score_trader(purchase_id=purchase_id, db=db)
        await db.commit()
        await db.refresh(profile)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ALLOCATION STRATEGIES
# ─────────────────────────────────────────────────────────────

@router.get(
    "/strategies",
    response_model=List[AllocationStrategySchema],
    summary="List all company allocation strategies",
)
async def list_strategies(
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Returns all company capital allocation strategies governing shadow copy operations."""
    stmt = select(CompanyAllocationStrategy).order_by(desc(CompanyAllocationStrategy.created_at))
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/strategies",
    response_model=AllocationStrategySchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new allocation strategy",
)
async def create_strategy(
    payload: AdminCreateStrategyRequest,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Super Admin only: Creates a new company allocation strategy linked to a broker account."""
    # Verify broker account exists
    broker = (
        await db.execute(
            select(CompanyBrokerAccount).where(
                CompanyBrokerAccount.id == payload.broker_account_id,
                CompanyBrokerAccount.is_active == True,
            )
        )
    ).scalar_one_or_none()
    if not broker:
        raise HTTPException(status_code=404, detail="Broker account not found or inactive")

    strategy = CompanyAllocationStrategy(
        name=payload.name,
        description=payload.description,
        broker_account_id=payload.broker_account_id,
        min_signal_score=payload.min_signal_score,
        max_allocated_capital=payload.max_allocated_capital,
        lot_multiplier=payload.lot_multiplier,
        max_daily_loss_limit=payload.max_daily_loss_limit,
        stop_loss_required=payload.stop_loss_required,
        allowed_symbols=payload.allowed_symbols,
        status=AllocationStatus.ACTIVE,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return strategy


@router.patch(
    "/strategies/{strategy_id}/status",
    response_model=AllocationStrategySchema,
    summary="Update allocation strategy status (ACTIVE / PAUSED / STOPPED)",
)
async def update_strategy_status(
    strategy_id: str,
    payload: AdminUpdateStrategyStatusRequest,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Super Admin only: Pauses, activates, or stops a company allocation strategy."""
    strategy = (
        await db.execute(
            select(CompanyAllocationStrategy).where(CompanyAllocationStrategy.id == strategy_id)
        )
    ).scalar_one_or_none()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    strategy.status = payload.status
    await db.commit()
    await db.refresh(strategy)
    return strategy


# ─────────────────────────────────────────────────────────────
# ORDER EXECUTIONS JOURNAL
# ─────────────────────────────────────────────────────────────

@router.get(
    "/executions",
    response_model=List[OrderExecutionSchema],
    summary="Company capital order execution journal",
)
async def list_executions(
    limit: int = Query(50, ge=1, le=500),
    broker_account_id: Optional[str] = Query(None),
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the full execution log of real trades placed on company broker accounts.
    Profits here belong exclusively to company capital reserves.
    """
    stmt = (
        select(CompanyOrderExecution)
        .order_by(desc(CompanyOrderExecution.open_time))
        .limit(limit)
    )
    if broker_account_id:
        stmt = stmt.where(CompanyOrderExecution.broker_account_id == broker_account_id)

    result = await db.execute(stmt)
    return result.scalars().all()
