"""
Phase 10: Affiliate Partner Network, Coupon & Commission Tracking Service.
Handles multi-tier commission calculations, referral attribution, coupon validation,
anti-self-referral validation, and affiliate balance settlement.
"""
from __future__ import annotations

import secrets
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.affiliate import (
    AffiliateProfile,
    Coupon,
    ReferralCommission,
    AffiliatePayoutRequest,
    AffiliateTier,
)
from app.models.user import User
from app.schemas.affiliate import CouponValidateResponse


class AffiliateService:
    @staticmethod
    def generate_referral_code() -> str:
        """Generates an uppercase alphanumeric referral code."""
        return f"RFX{secrets.token_hex(3).upper()}"

    async def get_or_create_profile(
        self,
        db: AsyncSession,
        user_id: str,
        custom_code: Optional[str] = None,
        payout_method: Optional[str] = "CRYPTO_USDT",
        payout_address: Optional[str] = None,
    ) -> AffiliateProfile:
        """Gets existing affiliate profile or creates a new one with a unique referral code."""
        stmt = select(AffiliateProfile).where(AffiliateProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        if profile:
            if payout_address and payout_address != profile.payout_address:
                profile.payout_address = payout_address
            if payout_method and payout_method != profile.payout_method:
                profile.payout_method = payout_method
            await db.commit()
            await db.refresh(profile)
            return profile

        # Determine referral code
        if custom_code:
            code = custom_code.strip().upper()
            existing_code_stmt = select(AffiliateProfile).where(AffiliateProfile.referral_code == code)
            existing = (await db.execute(existing_code_stmt)).scalar_one_or_none()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Referral code '{code}' is already claimed by another affiliate.",
                )
        else:
            code = self.generate_referral_code()

        profile = AffiliateProfile(
            user_id=user_id,
            referral_code=code,
            commission_rate=Decimal("10.00"),
            tier=AffiliateTier.STANDARD.value,
            payout_method=payout_method,
            payout_address=payout_address,
            is_active=True,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    async def get_profile_by_user(self, db: AsyncSession, user_id: str) -> Optional[AffiliateProfile]:
        stmt = select(AffiliateProfile).where(AffiliateProfile.user_id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def validate_and_apply_coupon(
        self,
        db: AsyncSession,
        code: str,
        original_price: Decimal,
    ) -> CouponValidateResponse:
        """Validates a coupon code and calculates the discount."""
        clean_code = code.strip().upper()
        stmt = select(Coupon).where(Coupon.code == clean_code)
        res = await db.execute(stmt)
        coupon = res.scalar_one_or_none()

        if not coupon:
            return CouponValidateResponse(
                valid=False,
                code=clean_code,
                discount_percentage=Decimal("0.00"),
                discount_amount=Decimal("0.00"),
                final_price=original_price,
                message=f"Coupon code '{clean_code}' does not exist.",
            )

        if not coupon.is_active:
            return CouponValidateResponse(
                valid=False,
                code=clean_code,
                discount_percentage=Decimal("0.00"),
                discount_amount=Decimal("0.00"),
                final_price=original_price,
                message=f"Coupon code '{clean_code}' is inactive.",
            )

        if coupon.max_uses and coupon.times_used >= coupon.max_uses:
            return CouponValidateResponse(
                valid=False,
                code=clean_code,
                discount_percentage=Decimal("0.00"),
                discount_amount=Decimal("0.00"),
                final_price=original_price,
                message=f"Coupon code '{clean_code}' has reached its maximum redemptions.",
            )

        if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
            return CouponValidateResponse(
                valid=False,
                code=clean_code,
                discount_percentage=Decimal("0.00"),
                discount_amount=Decimal("0.00"),
                final_price=original_price,
                message=f"Coupon code '{clean_code}' has expired.",
            )

        discount_amount = (original_price * (coupon.discount_percentage / Decimal("100"))).quantize(Decimal("0.01"))
        final_price = max(Decimal("0.00"), original_price - discount_amount)

        return CouponValidateResponse(
            valid=True,
            code=clean_code,
            discount_percentage=coupon.discount_percentage,
            discount_amount=discount_amount,
            final_price=final_price,
            message=f"Coupon applied: {coupon.discount_percentage}% discount!",
        )

    async def record_referral_sale(
        self,
        db: AsyncSession,
        referral_code: str,
        purchase_id: str,
        purchase_amount: Decimal,
        buyer_user_id: str,
    ) -> Optional[ReferralCommission]:
        """
        Attributed referral sale: applies anti-self-referral guard,
        calculates commission, credits affiliate balance, and checks tier progression.
        """
        code = referral_code.strip().upper()
        stmt = select(AffiliateProfile).where(AffiliateProfile.referral_code == code)
        res = await db.execute(stmt)
        affiliate = res.scalar_one_or_none()

        if not affiliate or not affiliate.is_active:
            return None

        # Anti-self-referral guard: cannot earn commission on your own purchase
        if affiliate.user_id == buyer_user_id:
            return None

        # Calculate commission
        rate = Decimal(str(affiliate.commission_rate))
        commission_amount = (purchase_amount * (rate / Decimal("100"))).quantize(Decimal("0.01"))

        commission = ReferralCommission(
            affiliate_id=affiliate.id,
            referred_user_id=buyer_user_id,
            purchase_id=purchase_id,
            purchase_amount=purchase_amount,
            commission_rate=rate,
            commission_amount=commission_amount,
            status="APPROVED",
        )
        db.add(commission)

        # Update affiliate aggregate stats
        affiliate.total_purchases_referred += 1
        affiliate.total_sales_volume = Decimal(str(affiliate.total_sales_volume)) + purchase_amount
        affiliate.total_commission_earned = Decimal(str(affiliate.total_commission_earned)) + commission_amount
        affiliate.commission_balance = Decimal(str(affiliate.commission_balance)) + commission_amount

        # Automatic Tier Progression
        # Standard: 10% (0-$10k)
        # Pro: 15% ($10k-$50k)
        # Elite: 20% (>$50k)
        total_vol = affiliate.total_sales_volume
        if total_vol >= Decimal("50000.00") and affiliate.tier != AffiliateTier.ELITE.value:
            affiliate.tier = AffiliateTier.ELITE.value
            affiliate.commission_rate = Decimal("20.00")
        elif total_vol >= Decimal("10000.00") and affiliate.tier == AffiliateTier.STANDARD.value:
            affiliate.tier = AffiliateTier.PRO.value
            affiliate.commission_rate = Decimal("15.00")

        await db.commit()
        await db.refresh(commission)
        return commission

    async def request_payout(
        self,
        db: AsyncSession,
        user_id: str,
        amount: Decimal,
        method: str,
        destination: str,
    ) -> AffiliatePayoutRequest:
        """Deducts commission balance and creates a payout request."""
        profile = await self.get_profile_by_user(db, user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Affiliate profile not found.",
            )

        if amount < Decimal("50.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum affiliate commission payout is $50.00.",
            )

        if Decimal(str(profile.commission_balance)) < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient commission balance. Available: ${profile.commission_balance}",
            )

        # Deduct balance immediately to prevent double withdrawal
        profile.commission_balance = Decimal(str(profile.commission_balance)) - amount

        payout = AffiliatePayoutRequest(
            affiliate_id=profile.id,
            amount=amount,
            method=method,
            destination=destination,
            status="REQUESTED",
        )
        db.add(payout)
        await db.commit()
        await db.refresh(payout)
        return payout

    async def admin_review_payout(
        self,
        db: AsyncSession,
        payout_id: str,
        new_status: str,
        admin_notes: Optional[str] = None,
    ) -> AffiliatePayoutRequest:
        """Finance admin approves or rejects an affiliate commission payout request."""
        stmt = select(AffiliatePayoutRequest).where(AffiliatePayoutRequest.id == payout_id)
        res = await db.execute(stmt)
        payout = res.scalar_one_or_none()
        if not payout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Payout request {payout_id} not found",
            )

        if payout.status != "REQUESTED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payout request is already {payout.status}",
            )

        # Fetch affiliate profile
        aff_stmt = select(AffiliateProfile).where(AffiliateProfile.id == payout.affiliate_id)
        aff_res = await db.execute(aff_stmt)
        affiliate = aff_res.scalar_one()

        payout.status = new_status
        payout.admin_notes = admin_notes
        payout.processed_at = datetime.now(timezone.utc)

        if new_status == "PAID":
            affiliate.total_commission_paid = Decimal(str(affiliate.total_commission_paid)) + payout.amount
        elif new_status == "REJECTED":
            # Refund commission balance
            affiliate.commission_balance = Decimal(str(affiliate.commission_balance)) + payout.amount

        await db.commit()
        await db.refresh(payout)
        return payout
