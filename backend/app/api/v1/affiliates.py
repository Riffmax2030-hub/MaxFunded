"""
Phase 10: Affiliate Partner Network & Promo Coupon API Endpoints.
"""
from __future__ import annotations

from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user, require_roles, RoleName
from app.models.affiliate import (
    AffiliateProfile,
    Coupon,
    ReferralCommission,
    AffiliatePayoutRequest,
)
from app.models.user import User
from app.schemas.affiliate import (
    AffiliateRegisterRequest,
    AffiliateUpdatePayoutRequest,
    AffiliateProfileResponse,
    CouponCreateRequest,
    CouponResponse,
    CouponValidateResponse,
    ReferralCommissionResponse,
    AffiliatePayoutCreate,
    AffiliatePayoutResponse,
    AdminAffiliatePayoutReview,
)
from app.services.affiliate_service import AffiliateService

router = APIRouter(prefix="/affiliates", tags=["Affiliate & Referral Network"])
aff_service = AffiliateService()


# ──────────────────────────────────────────
# Trader Affiliate Endpoints
# ──────────────────────────────────────────

@router.post("/register", response_model=AffiliateProfileResponse, status_code=status.HTTP_201_CREATED)
async def register_affiliate(
    payload: AffiliateRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Enroll as a Riffmax Funding affiliate partner with a unique or custom referral code."""
    return await aff_service.get_or_create_profile(
        db=db,
        user_id=current_user.id,
        custom_code=payload.referral_code,
        payout_method=payload.payout_method,
        payout_address=payload.payout_address,
    )


@router.get("/me", response_model=AffiliateProfileResponse)
async def get_my_affiliate_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the logged-in trader's affiliate metrics, referral link code, and commission balance."""
    profile = await aff_service.get_profile_by_user(db, current_user.id)
    if not profile:
        # Auto-enroll with generated code if not enrolled yet
        profile = await aff_service.get_or_create_profile(db, current_user.id)
    return profile


@router.post("/update-payout", response_model=AffiliateProfileResponse)
async def update_affiliate_payout_settings(
    payload: AffiliateUpdatePayoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update preferred commission withdrawal method and destination."""
    profile = await aff_service.get_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate profile not found")

    profile.payout_method = payload.payout_method
    profile.payout_address = payload.payout_address
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/commissions", response_model=List[ReferralCommissionResponse])
async def list_my_referral_commissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full history of earned referral commissions."""
    profile = await aff_service.get_profile_by_user(db, current_user.id)
    if not profile:
        return []

    stmt = (
        select(ReferralCommission)
        .where(ReferralCommission.affiliate_id == profile.id)
        .order_by(desc(ReferralCommission.created_at))
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("/payout-request", response_model=AffiliatePayoutResponse, status_code=status.HTTP_201_CREATED)
async def request_commission_payout(
    payload: AffiliatePayoutCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Request withdrawal of accumulated affiliate commissions ($50.00 minimum)."""
    return await aff_service.request_payout(
        db=db,
        user_id=current_user.id,
        amount=payload.amount,
        method=payload.method,
        destination=payload.destination,
    )


@router.get("/payouts", response_model=List[AffiliatePayoutResponse])
async def list_my_payout_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all affiliate payout requests and their processing statuses."""
    profile = await aff_service.get_profile_by_user(db, current_user.id)
    if not profile:
        return []

    stmt = (
        select(AffiliatePayoutRequest)
        .where(AffiliatePayoutRequest.affiliate_id == profile.id)
        .order_by(desc(AffiliatePayoutRequest.created_at))
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


# ──────────────────────────────────────────
# Public Coupon Validation Endpoint
# ──────────────────────────────────────────

@router.get("/coupons/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    code: str = Query(..., min_length=2),
    price: Decimal = Query(..., ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Public validation endpoint called by the checkout UI to apply discount coupons."""
    return await aff_service.validate_and_apply_coupon(db, code=code, original_price=price)


# ──────────────────────────────────────────
# Admin Controls
# ──────────────────────────────────────────

@router.post(
    "/admin/coupons",
    response_model=CouponResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin create promo coupon",
)
async def admin_create_coupon(
    payload: CouponCreateRequest,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Create a promotional discount coupon code."""
    clean_code = payload.code.strip().upper()
    existing_stmt = select(Coupon).where(Coupon.code == clean_code)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon code '{clean_code}' already exists.",
        )

    affiliate_id = None
    if payload.affiliate_code:
        aff_stmt = select(AffiliateProfile).where(AffiliateProfile.referral_code == payload.affiliate_code.strip().upper())
        aff = (await db.execute(aff_stmt)).scalar_one_or_none()
        if aff:
            affiliate_id = aff.id

    coupon = Coupon(
        code=clean_code,
        discount_percentage=payload.discount_percentage,
        max_uses=payload.max_uses,
        affiliate_id=affiliate_id,
        is_active=True,
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.get(
    "/admin/coupons",
    response_model=List[CouponResponse],
    summary="Admin list all promo coupons",
)
async def admin_list_coupons(
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """List all created coupons and their redemption counts."""
    stmt = select(Coupon).order_by(desc(Coupon.created_at))
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get(
    "/admin/payouts",
    response_model=List[AffiliatePayoutResponse],
    summary="Admin list affiliate payout requests queue",
)
async def admin_list_payout_queue(
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Queue of affiliate commission payouts awaiting finance review."""
    stmt = select(AffiliatePayoutRequest).order_by(desc(AffiliatePayoutRequest.created_at))
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post(
    "/admin/payouts/{id}/review",
    response_model=AffiliatePayoutResponse,
    summary="Admin approve or reject affiliate payout",
)
async def admin_review_payout(
    id: str,
    payload: AdminAffiliatePayoutReview,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Finance admin approves (marks PAID) or rejects (restores balance) an affiliate payout."""
    return await aff_service.admin_review_payout(
        db=db,
        payout_id=id,
        new_status=payload.status,
        admin_notes=payload.admin_notes,
    )
