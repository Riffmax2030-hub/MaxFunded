from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    country_code = user_in.country.upper()
    restricted_countries = settings.get_restricted_countries()
    if country_code in restricted_countries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration is not available from country code '{country_code}' due to regulatory restrictions."
        )

    if not (user_in.accepted_terms and user_in.accepted_privacy and user_in.accepted_risk_disclosure):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the Terms of Service, Privacy Policy, and Risk Disclosure to proceed."
        )

    # Check for existing email
    stmt = select(User).where(User.email == user_in.email.lower())
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # KYC requirement determination
    kyc_required = country_code in settings.get_kyc_required_countries()
    kyc_status = "PENDING" if kyc_required else "NOT_REQUIRED"

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        country=country_code,
        phone=user_in.phone,
        is_active=True,
        is_verified=False,
        is_admin=False,
        role="TRADER",
        kyc_status=kyc_status,
        accepted_terms=user_in.accepted_terms,
        accepted_privacy=user_in.accepted_privacy,
        accepted_risk_disclosure=user_in.accepted_risk_disclosure,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is suspended or inactive"
        )

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        is_admin=user.is_admin,
    )
