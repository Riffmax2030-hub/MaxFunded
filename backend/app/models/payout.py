import enum
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    ForeignKey,
    DateTime,
    Text,
    JSON,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class PayoutMethod(str, enum.Enum):
    CRYPTO_USDT_TRC20 = "CRYPTO_USDT_TRC20"
    CRYPTO_USDT_ERC20 = "CRYPTO_USDT_ERC20"
    BANK_WIRE_SWIFT = "BANK_WIRE_SWIFT"
    LOCAL_BANK_NGN = "LOCAL_BANK_NGN"
    PAYPAL = "PAYPAL"


class PayoutStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    PROCESSING = "PROCESSING"
    PAID = "PAID"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class PayoutRequest(BaseModel):
    """
    Trader profit share payout / withdrawal request.
    Enforces KYC verification, profit split calculations, and two-step finance approval.
    """
    __tablename__ = "payout_requests"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_id = Column(String(36), ForeignKey("challenge_purchases.id", ondelete="CASCADE"), nullable=False, index=True)

    # Financial breakdown
    amount = Column(Numeric(18, 2), nullable=False)  # Gross profit being withdrawn from trading account
    trader_amount = Column(Numeric(18, 2), nullable=False)  # Net amount paid out to trader (e.g. 80%)
    company_fee_amount = Column(Numeric(18, 2), nullable=False)  # Retained company share (e.g. 20%)
    profit_split_percentage = Column(Numeric(5, 2), default=Decimal("80.00"), nullable=False)
    currency = Column(String(10), default="USD", nullable=False)

    # Withdrawal method & credentials
    method = Column(SAEnum(PayoutMethod, name="payoutmethod"), nullable=False)
    payout_details = Column(JSON, default=dict, nullable=False)  # Wallet address, bank details, IBAN, etc.

    # Status & Audit
    status = Column(
        SAEnum(PayoutStatus, name="payoutstatus"),
        default=PayoutStatus.REQUESTED,
        nullable=False,
        index=True,
    )
    tx_hash_or_reference = Column(String(255), nullable=True)  # Blockchain tx hash or bank wire reference
    rejection_reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)

    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    requested_at = Column(DateTime(timezone=True), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    purchase = relationship("ChallengePurchase")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
