"""
Phase 9: Cryptographic Certificate of Achievement Model.
Generates tamper-proof certificates with SHA-256 cryptographic signatures
for Phase 1 Pass, Phase 2 Pass, Funded Trader, and Payout milestones.
"""
from __future__ import annotations

import enum
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    Text,
)
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class CertificateType(str, enum.Enum):
    PHASE_1_PASSED = "PHASE_1_PASSED"
    PHASE_2_PASSED = "PHASE_2_PASSED"
    FUNDED_TRADER = "FUNDED_TRADER"
    PAYOUT_ACHIEVER = "PAYOUT_ACHIEVER"


class Certificate(BaseModel):
    __tablename__ = "certificates"

    certificate_code = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(
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

    certificate_type = Column(
        SAEnum(CertificateType, name="certificate_type_enum"),
        nullable=False,
        index=True,
    )

    trader_name = Column(String(120), nullable=False)
    challenge_name = Column(String(120), nullable=False)
    account_size = Column(Numeric(18, 4), nullable=False)
    payout_amount = Column(Numeric(18, 4), nullable=True)

    # Cryptographic integrity signature (SHA-256 HMAC of verification data)
    sha256_signature = Column(String(64), nullable=False)

    # Status & Revocation
    is_revoked = Column(Boolean, default=False, nullable=False)
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", backref="certificates")
    purchase = relationship("ChallengePurchase", backref="certificates")
