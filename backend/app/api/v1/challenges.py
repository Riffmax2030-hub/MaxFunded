from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.user import User
from app.models.challenge import Challenge, ChallengeRule, ChallengePurchase
from app.services.mt5_service import mt5_service
from app.services.email_service import email_service
from app.schemas.challenge import (
    ChallengeResponse,
    ChallengePurchaseCreate,
    ChallengePurchaseResponse,
)

router = APIRouter()


@router.get("", response_model=List[ChallengeResponse])
async def list_active_challenges(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Challenge)
        .where(Challenge.is_active == True)
        .options(selectinload(Challenge.rules))
        .order_by(Challenge.starting_balance.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{challenge_id}", response_model=ChallengeResponse)
async def get_challenge_by_id(challenge_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Challenge)
        .where(Challenge.id == challenge_id)
        .options(selectinload(Challenge.rules))
    )
    result = await db.execute(stmt)
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return challenge


@router.post("/purchase", response_model=ChallengePurchaseResponse, status_code=status.HTTP_201_CREATED)
async def purchase_challenge(
    purchase_in: ChallengePurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify challenge
    stmt = select(Challenge).where(Challenge.id == purchase_in.challenge_id)
    result = await db.execute(stmt)
    challenge = result.scalar_one_or_none()
    if not challenge or not challenge.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active challenge not found"
        )

    # Initial purchase creation in PENDING_PAYMENT state
    purchase = ChallengePurchase(
        user_id=current_user.id,
        challenge_id=challenge.id,
        status="PENDING_PAYMENT",
        purchase_price=challenge.price,
        currency=challenge.currency,
        current_balance=challenge.starting_balance,
        current_equity=challenge.starting_balance,
        daily_starting_equity=challenge.starting_balance,
        high_water_mark=challenge.starting_balance,
        trading_days_count=0,
    )
    db.add(purchase)
    await db.commit()
    await db.refresh(purchase)
    
    # Reload with nested challenge & rules relations
    stmt_reload = (
        select(ChallengePurchase)
        .where(ChallengePurchase.id == purchase.id)
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
    )
    res_reload = await db.execute(stmt_reload)
    return res_reload.scalar_one()


@router.post("/trial", response_model=ChallengePurchaseResponse, status_code=status.HTTP_201_CREATED)
async def claim_free_cfd_trial(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Provisions an instant 14-day $100K CFD Trial account for the trader with zero fee.
    Simulated MT5 login credentials are generated and dispatched via email.
    """
    trial_slug = "100k-cfd-free-trial"
    stmt = select(Challenge).where(Challenge.slug == trial_slug).options(selectinload(Challenge.rules))
    res = await db.execute(stmt)
    trial_challenge = res.scalar_one_or_none()

    if not trial_challenge:
        trial_challenge = Challenge(
            name="$100,000 CFD Free Trial",
            slug=trial_slug,
            starting_balance=Decimal("100000.00"),
            price=Decimal("0.00"),
            currency="USD",
            description="14-Day Free CFD Trial with institutional simulated liquidity and MT5 access.",
            is_active=True,
        )
        db.add(trial_challenge)
        await db.flush()

        rules = ChallengeRule(
            challenge_id=trial_challenge.id,
            profit_target_percentage=Decimal("10.00"),
            max_daily_loss_percentage=Decimal("5.00"),
            max_drawdown_percentage=Decimal("10.00"),
            daily_loss_methodology="STARTING_EQUITY",
            drawdown_methodology="STATIC",
            min_trading_days=0,
            max_trading_days=14,
            leverage=100,
            profit_split_percentage=Decimal("80.00"),
            weekend_trading_allowed=True,
            news_trading_allowed=True,
            ea_trading_allowed=True,
            copy_trading_allowed=False,
            stop_loss_required=False,
        )
        db.add(rules)
        await db.flush()

    # Check if user already has an active trial
    existing_stmt = (
        select(ChallengePurchase)
        .where(
            ChallengePurchase.user_id == current_user.id,
            ChallengePurchase.challenge_id == trial_challenge.id,
            ChallengePurchase.status.in_(["ACTIVE", "PENDING_PAYMENT", "PROVISIONING"]),
        )
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
    )
    existing_res = await db.execute(existing_stmt)
    existing_purchase = existing_res.scalar_one_or_none()
    if existing_purchase:
        return existing_purchase

    purchase = ChallengePurchase(
        user_id=current_user.id,
        challenge_id=trial_challenge.id,
        status="ACTIVE",
        purchase_price=Decimal("0.00"),
        currency="USD",
        current_balance=trial_challenge.starting_balance,
        current_equity=trial_challenge.starting_balance,
        daily_starting_equity=trial_challenge.starting_balance,
        high_water_mark=trial_challenge.starting_balance,
        trading_days_count=0,
    )
    db.add(purchase)
    await db.flush()

    await mt5_service.provision_mt5_account(
        purchase=purchase,
        challenge=trial_challenge,
        db=db,
        server_name="MaxFunded-TrialSim",
    )

    try:
        await email_service.send_credentials_email(
            to_email=current_user.email,
            trader_name=current_user.full_name or "Trader",
            challenge_name="$100K CFD Free Trial",
            starting_balance=float(trial_challenge.starting_balance),
            mt5_login=purchase.mt5_login or "Pending",
            mt5_password=purchase.mt5_password or "Pending",
            mt5_investor_password=purchase.mt5_investor_password or "Pending",
            mt5_server=purchase.mt5_server or "MaxFunded-TrialSim",
        )
    except Exception:
        pass

    await db.commit()
    await db.refresh(purchase)

    stmt_reload = (
        select(ChallengePurchase)
        .where(ChallengePurchase.id == purchase.id)
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
    )
    res_reload = await db.execute(stmt_reload)
    return res_reload.scalar_one()

