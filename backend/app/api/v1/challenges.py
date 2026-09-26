from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase
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
