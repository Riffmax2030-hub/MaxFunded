"""
Phase 10: Affiliate Partner Network, Promo Coupons & Multi-Tier Referral Commission Models.
Enables organic growth via referral links, customizable promo codes, and automated commission accruals.
"""
from __future__ import annotations

import enum
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Integer,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AffiliateTier(str, enum.Enum):
    STANDARD = "STANDARD"  # 10%
    PRO = "PRO"            # 15%
    ELITE = "ELITE"        # 20%


class CommissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class AffiliatePayoutStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    PROCESSING = "PROCESSING"
    PAID = "PAID"
    REJECTED = "REJECTED"


class AffiliateProfile(BaseModel):
    __tablename__ = "affiliate_profiles"

    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    referral_code = Column(String(32), unique=True, index=True, nullable=False)
    commission_rate = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)
    tier = Column(String(20), default="STANDARD", nullable=False)

    total_referred_users = Column(Integer, default=0, nullable=False)
    total_purchases_referred = Column(Integer, default=0, nullable=False)
    total_sales_volume = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    total_commission_earned = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    commission_balance = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    total_commission_paid = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)

    payout_method = Column(String(50), nullable=True)
    payout_address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", backref="affiliate_profile")
    commissions = relationship("ReferralCommission", back_populates="affiliate", cascade="all, delete-orphan")
    payout_requests = relationship("AffiliatePayoutRequest", back_populates="affiliate", cascade="all, delete-orphan")
    coupons = relationship("Coupon", back_populates="affiliate")


class Coupon(BaseModel):
    __tablename__ = "coupons"

    code = Column(String(32), unique=True, index=True, nullable=False)
    discount_percentage = Column(Numeric(5, 2), nullable=False)
    max_uses = Column(Integer, nullable=True)
    times_used = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    affiliate_id = Column(
        String(36),
        ForeignKey("affiliate_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    affiliate = relationship("AffiliateProfile", back_populates="coupons")


class ReferralCommission(BaseModel):
    __tablename__ = "referral_commissions"

    affiliate_id = Column(
        String(36),
        ForeignKey("affiliate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    referred_user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    purchase_id = Column(
        String(36),
        ForeignKey("challenge_purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    purchase_amount = Column(Numeric(18, 4), nullable=False)
    commission_rate = Column(Numeric(5, 2), nullable=False)
    commission_amount = Column(Numeric(18, 4), nullable=False)
    status = Column(String(20), default="APPROVED", nullable=False)

    affiliate = relationship("AffiliateProfile", back_populates="commissions")
    referred_user = relationship("User", foreign_keys=[referred_user_id])
    purchase = relationship("ChallengePurchase")


class AffiliatePayoutRequest(BaseModel):
    __tablename__ = "affiliate_payout_requests"

    affiliate_id = Column(
        String(36),
        ForeignKey("affiliate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount = Column(Numeric(18, 4), nullable=False)
    method = Column(String(50), nullable=False)
    destination = Column(String(255), nullable=False)
    status = Column(String(20), default="REQUESTED", nullable=False)
    admin_notes = Column(Text, nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    affiliate = relationship("AffiliateProfile", back_populates="payout_requests")
