from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.challenge import ChallengePurchaseResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_in.full_name is not None and user_in.full_name.strip():
        current_user.full_name = user_in.full_name.strip()
    if user_in.country is not None and user_in.country.strip():
        current_user.country = user_in.country.strip().upper()[:2]
    if user_in.phone is not None:
        current_user.phone = user_in.phone.strip()
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/me/purchases", response_model=List[ChallengePurchaseResponse])
async def read_user_purchases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ChallengePurchase)
        .where(ChallengePurchase.user_id == current_user.id)
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
        .order_by(ChallengePurchase.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
