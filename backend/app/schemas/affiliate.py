"""
Phase 10: Pydantic Schemas for Affiliate Partner Network, Coupons & Commissions.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class AffiliateRegisterRequest(BaseModel):
    referral_code: Optional[str] = Field(None, min_length=3, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")
    payout_method: Optional[str] = "CRYPTO_USDT"
    payout_address: Optional[str] = None


class AffiliateUpdatePayoutRequest(BaseModel):
    payout_method: str
    payout_address: str


class AffiliateProfileResponse(BaseModel):
    id: str
    user_id: str
    referral_code: str
    commission_rate: Decimal
    tier: str
    total_referred_users: int
    total_purchases_referred: int
    total_sales_volume: Decimal
    total_commission_earned: Decimal
    commission_balance: Decimal
    total_commission_paid: Decimal
    payout_method: Optional[str] = None
    payout_address: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponCreateRequest(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")
    discount_percentage: Decimal = Field(..., ge=1, le=50)
    max_uses: Optional[int] = None
    affiliate_code: Optional[str] = None


class CouponResponse(BaseModel):
    id: str
    code: str
    discount_percentage: Decimal
    max_uses: Optional[int] = None
    times_used: int
    is_active: bool
    affiliate_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_percentage: Decimal
    discount_amount: Decimal
    final_price: Decimal
    message: str


class ReferralCommissionResponse(BaseModel):
    id: str
    affiliate_id: str
    purchase_id: str
    purchase_amount: Decimal
    commission_rate: Decimal
    commission_amount: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AffiliatePayoutCreate(BaseModel):
    amount: Decimal = Field(..., ge=50, description="Minimum payout is $50.00")
    method: str = Field(..., description="CRYPTO_USDT, BANK_WIRE, PAYPAL")
    destination: str = Field(..., min_length=5, max_length=255)


class AffiliatePayoutResponse(BaseModel):
    id: str
    affiliate_id: str
    amount: Decimal
    method: str
    destination: str
    status: str
    admin_notes: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminAffiliatePayoutReview(BaseModel):
    status: str = Field(..., pattern=r"^(PAID|REJECTED)$")
    admin_notes: Optional[str] = None
