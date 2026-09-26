import enum
from sqlalchemy import Column, String, Numeric, ForeignKey, JSON, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class PaymentProvider(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    FLUTTERWAVE = "flutterwave"
    PAYSTACK = "paystack"
    NOWPAYMENTS = "nowpayments"  # crypto
    BANK_TRANSFER = "bank_transfer"  # manual SWIFT/wire — admin-confirmed


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"               # Created, awaiting user action
    PROCESSING = "PROCESSING"         # User submitted, awaiting provider confirm
    COMPLETED = "COMPLETED"           # Provider confirmed payment received
    FAILED = "FAILED"                 # Payment failed / declined
    REFUNDED = "REFUNDED"             # Refunded to trader
    CANCELLED = "CANCELLED"           # Cancelled by user or timeout
    AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION"  # Bank transfer — awaiting admin


class Payment(BaseModel):
    """
    Records every payment attempt tied to a challenge purchase.
    One purchase may have multiple payment attempts (retries).
    Only one COMPLETED payment per purchase is valid.
    """
    __tablename__ = "payments"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    purchase_id = Column(String(36), ForeignKey("challenge_purchases.id", ondelete="SET NULL"), nullable=True, index=True)

    provider = Column(SAEnum(PaymentProvider, name="paymentprovider"), nullable=False)
    provider_reference = Column(String(512), nullable=True, index=True)  # External payment/session ID
    provider_metadata = Column(JSON, default=dict, nullable=False)        # Raw webhook / response data

    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="USD", nullable=False)

    status = Column(
        SAEnum(PaymentStatus, name="paymentstatus"),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Crypto-specific fields
    crypto_address = Column(String(255), nullable=True)
    crypto_amount = Column(Numeric(20, 8), nullable=True)
    crypto_currency = Column(String(20), nullable=True)

    # Bank transfer fields
    payment_reference_code = Column(String(64), nullable=True)  # Unique code trader includes in transfer

    # Admin notes (for manual confirmation)
    admin_notes = Column(Text, nullable=True)
    confirmed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="select")
    purchase = relationship("ChallengePurchase", foreign_keys=[purchase_id], lazy="select")
