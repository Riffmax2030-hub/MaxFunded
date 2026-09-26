import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_active_admin
from app.models.user import User
from app.models.challenge import Challenge, ChallengeRule, ChallengePurchase
from app.models.audit import AuditLog
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    ChallengePurchaseResponse,
)
from app.schemas.user import UserResponse, AdminUserUpdate

router = APIRouter()


@router.get("/challenges", response_model=List[ChallengeResponse])
async def admin_list_challenges(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Challenge).options(selectinload(Challenge.rules)).order_by(Challenge.starting_balance.asc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_challenge(
    challenge_in: ChallengeCreate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    # Verify slug uniqueness
    stmt = select(Challenge).where(Challenge.slug == challenge_in.slug)
    if (await db.execute(stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Challenge slug '{challenge_in.slug}' already exists."
        )

    challenge = Challenge(
        name=challenge_in.name,
        slug=challenge_in.slug,
        starting_balance=challenge_in.starting_balance,
        price=challenge_in.price,
        currency=challenge_in.currency,
        description=challenge_in.description,
        is_active=challenge_in.is_active,
    )
    db.add(challenge)
    await db.flush()

    rules = ChallengeRule(
        challenge_id=challenge.id,
        profit_target_percentage=challenge_in.rules.profit_target_percentage,
        max_daily_loss_percentage=challenge_in.rules.max_daily_loss_percentage,
        max_drawdown_percentage=challenge_in.rules.max_drawdown_percentage,
        daily_loss_methodology=challenge_in.rules.daily_loss_methodology,
        drawdown_methodology=challenge_in.rules.drawdown_methodology,
        min_trading_days=challenge_in.rules.min_trading_days,
        max_trading_days=challenge_in.rules.max_trading_days,
        leverage=challenge_in.rules.leverage,
        profit_split_percentage=challenge_in.rules.profit_split_percentage,
        weekend_trading_allowed=challenge_in.rules.weekend_trading_allowed,
        news_trading_allowed=challenge_in.rules.news_trading_allowed,
        ea_trading_allowed=challenge_in.rules.ea_trading_allowed,
        copy_trading_allowed=challenge_in.rules.copy_trading_allowed,
        stop_loss_required=challenge_in.rules.stop_loss_required,
    )
    db.add(rules)

    # Immutable Audit Log
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_CREATE_CHALLENGE",
        target_type="CHALLENGE",
        target_id=challenge.id,
        new_value=json.dumps({"name": challenge.name, "price": str(challenge.price)}),
        reason="Admin created challenge tier"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(challenge)
    
    # Reload with rules
    stmt_reload = select(Challenge).where(Challenge.id == challenge.id).options(selectinload(Challenge.rules))
    return (await db.execute(stmt_reload)).scalar_one()


@router.put("/challenges/{challenge_id}", response_model=ChallengeResponse)
async def admin_update_challenge(
    challenge_id: str,
    challenge_in: ChallengeUpdate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Challenge).where(Challenge.id == challenge_id).options(selectinload(Challenge.rules))
    challenge = (await db.execute(stmt)).scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    prev_state = {"price": str(challenge.price), "is_active": challenge.is_active}

    if challenge_in.name is not None:
        challenge.name = challenge_in.name
    if challenge_in.starting_balance is not None:
        challenge.starting_balance = challenge_in.starting_balance
    if challenge_in.price is not None:
        challenge.price = challenge_in.price
    if challenge_in.currency is not None:
        challenge.currency = challenge_in.currency
    if challenge_in.description is not None:
        challenge.description = challenge_in.description
    if challenge_in.is_active is not None:
        challenge.is_active = challenge_in.is_active

    if challenge_in.rules and challenge.rules:
        r = challenge_in.rules
        challenge.rules.profit_target_percentage = r.profit_target_percentage
        challenge.rules.max_daily_loss_percentage = r.max_daily_loss_percentage
        challenge.rules.max_drawdown_percentage = r.max_drawdown_percentage
        challenge.rules.daily_loss_methodology = r.daily_loss_methodology
        challenge.rules.drawdown_methodology = r.drawdown_methodology
        challenge.rules.min_trading_days = r.min_trading_days
        challenge.rules.max_trading_days = r.max_trading_days
        challenge.rules.leverage = r.leverage
        challenge.rules.profit_split_percentage = r.profit_split_percentage
        challenge.rules.weekend_trading_allowed = r.weekend_trading_allowed
        challenge.rules.news_trading_allowed = r.news_trading_allowed
        challenge.rules.ea_trading_allowed = r.ea_trading_allowed
        challenge.rules.copy_trading_allowed = r.copy_trading_allowed
        challenge.rules.stop_loss_required = r.stop_loss_required

    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_UPDATE_CHALLENGE",
        target_type="CHALLENGE",
        target_id=challenge.id,
        previous_value=json.dumps(prev_state),
        new_value=json.dumps({"price": str(challenge.price), "is_active": challenge.is_active}),
        reason="Admin updated challenge parameters"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(challenge)
    return challenge


@router.get("/users", response_model=List[UserResponse])
async def admin_list_users(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).order_by(User.created_at.desc())
    return (await db.execute(stmt)).scalars().all()


@router.get("/purchases", response_model=List[ChallengePurchaseResponse])
async def admin_list_purchases(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChallengePurchase)
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
        .order_by(ChallengePurchase.created_at.desc())
    )
    return (await db.execute(stmt)).scalars().all()


@router.post("/purchases/{purchase_id}/status")
async def admin_update_purchase_status(
    purchase_id: str,
    new_status: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    valid_statuses = {
        "PENDING_PAYMENT", "PAYMENT_CONFIRMED", "PROVISIONING", "ACTIVE",
        "WARNING", "BREACHED", "TARGET_REACHED", "UNDER_REVIEW", "PASSED",
        "FUNDED", "SUSPENDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID", "CLOSED"
    }
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid lifecycle status: {new_status}"
        )

    stmt = select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
    purchase = (await db.execute(stmt)).scalar_one_or_none()
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    old_status = purchase.status
    purchase.status = new_status
    
    # If set to ACTIVE, ensure simulated MT5 mock login is populated if not yet set
    if new_status == "ACTIVE" and not purchase.mt5_login:
        purchase.mt5_login = f"88{purchase_id[:6].upper()}"
        purchase.mt5_server = "RiffMax-Simulated-MT5"

    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_UPDATE_PURCHASE_STATUS",
        target_type="CHALLENGE_PURCHASE",
        target_id=purchase.id,
        previous_value=old_status,
        new_value=new_status,
        reason=f"Status transitioned from {old_status} to {new_status}"
    )
    db.add(audit)
    await db.commit()
    return {"message": "Status updated successfully", "purchase_id": purchase_id, "new_status": new_status}
