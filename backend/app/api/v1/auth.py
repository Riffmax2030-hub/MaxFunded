import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rbac import get_current_user
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.email_service import email_service

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# In-memory store: token -> (email, expires_at)
_reset_tokens: dict[str, tuple[str, datetime]] = {}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


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

    try:
        await email_service.send_welcome_email(user.email, user.full_name or "Trader")
    except Exception:
        pass

    return user


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    clean_email = str(credentials.email).strip().lower()
    clean_password = str(credentials.password).strip()
    stmt = select(User).where(User.email == clean_email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(clean_password, user.hashed_password):
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


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    clean_email = str(payload.email).strip().lower()
    stmt = select(User).where(User.email == clean_email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if user:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        _reset_tokens[token] = (user.email, expires_at)
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        await email_service.send_password_reset_email(
            to_email=user.email,
            trader_name=user.full_name or "Trader",
            reset_link=reset_link,
        )
    return {"message": "If that email is registered, a password reset link has been dispatched."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if payload.token not in _reset_tokens:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

    email, expires_at = _reset_tokens[payload.token]
    if datetime.now(timezone.utc) > expires_at:
        del _reset_tokens[payload.token]
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired. Please request a new one.")

    stmt = select(User).where(User.email == email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters.")

    user.hashed_password = get_password_hash(payload.new_password)
    db.add(user)
    await db.commit()
    del _reset_tokens[payload.token]
    return {"message": "Password updated successfully. You can now log in."}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password.")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 8 characters.")

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    await db.commit()
    return {"message": "Password updated successfully."}
