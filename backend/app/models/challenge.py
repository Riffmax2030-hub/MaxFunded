import enum
from decimal import Decimal
from sqlalchemy import Column, String, Boolean, Numeric, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class PurchaseStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED"
    PROVISIONING = "PROVISIONING"
    ACTIVE = "ACTIVE"
    WARNING = "WARNING"
    BREACHED = "BREACHED"
    TARGET_REACHED = "TARGET_REACHED"
    UNDER_REVIEW = "UNDER_REVIEW"
    PASSED = "PASSED"
    FUNDED = "FUNDED"
    SUSPENDED = "SUSPENDED"
    PAYOUT_PENDING = "PAYOUT_PENDING"
    PAYOUT_APPROVED = "PAYOUT_APPROVED"
    PAYOUT_PAID = "PAYOUT_PAID"
    CLOSED = "CLOSED"


class Challenge(BaseModel):
    __tablename__ = "challenges"

    name = Column(String(100), nullable=False)  # e.g., "$100,000 Challenge"
    slug = Column(String(100), unique=True, index=True, nullable=False)
    starting_balance = Column(Numeric(18, 4), nullable=False)  # 100000.0000
    price = Column(Numeric(18, 4), nullable=False)  # 499.0000
    currency = Column(String(3), default="USD", nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Challenge Tier Details
    rules = relationship("ChallengeRule", back_populates="challenge", uselist=False, cascade="all, delete-orphan")
    purchases = relationship("ChallengePurchase", back_populates="challenge")


class ChallengeRule(BaseModel):
    __tablename__ = "challenge_rules"

    challenge_id = Column(String(36), ForeignKey("challenges.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Financial & Risk Targets (percentages and values)
    profit_target_percentage = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)  # 10.00%
    max_daily_loss_percentage = Column(Numeric(5, 2), default=Decimal("5.00"), nullable=False)  # 5.00%
    max_drawdown_percentage = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)  # 10.00%
    
    # Methodologies
    daily_loss_methodology = Column(String(50), default="STARTING_EQUITY", nullable=False)  # STARTING_EQUITY, STARTING_BALANCE
    drawdown_methodology = Column(String(50), default="STATIC", nullable=False)  # STATIC, TRAILING_EQUITY, BALANCE
    
    # Trading Constraints
    min_trading_days = Column(Integer, default=5, nullable=False)
    max_trading_days = Column(Integer, nullable=True)  # Nullable for unlimited days
    leverage = Column(Integer, default=100, nullable=False)  # 1:100
    profit_split_percentage = Column(Numeric(5, 2), default=Decimal("80.00"), nullable=False)  # 80.00%
    
    # Rule Flags
    weekend_trading_allowed = Column(Boolean, default=True, nullable=False)
    news_trading_allowed = Column(Boolean, default=True, nullable=False)
    ea_trading_allowed = Column(Boolean, default=True, nullable=False)
    copy_trading_allowed = Column(Boolean, default=False, nullable=False)
    stop_loss_required = Column(Boolean, default=False, nullable=False)

    challenge = relationship("Challenge", back_populates="rules")


class ChallengePurchase(BaseModel):
    __tablename__ = "challenge_purchases"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id = Column(String(36), ForeignKey("challenges.id"), nullable=False, index=True)
    
    # Explicit Lifecycle State Machine:
    # PENDING_PAYMENT, PAYMENT_CONFIRMED, PROVISIONING, ACTIVE, WARNING,
    # BREACHED, TARGET_REACHED, UNDER_REVIEW, PASSED, FUNDED, SUSPENDED,
    # PAYOUT_PENDING, PAYOUT_APPROVED, PAYOUT_PAID, CLOSED
    status = Column(String(50), default="PENDING_PAYMENT", index=True, nullable=False)
    
    # Financial snapshot at purchase time
    purchase_price = Column(Numeric(18, 4), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # MT5 Simulated Account Details (Provisioned upon payment confirmation)
    mt5_login = Column(String(50), nullable=True, index=True)
    mt5_server = Column(String(100), nullable=True)
    mt5_password = Column(String(100), nullable=True)
    mt5_investor_password = Column(String(100), nullable=True)
    
    # Performance & Metric Tracking
    current_balance = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    current_equity = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    high_water_mark = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    daily_starting_equity = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    trading_days_count = Column(Integer, default=0, nullable=False)

    # Lifecycle milestones & breach recording
    breached_reason = Column(String(255), nullable=True)
    breached_at = Column(DateTime(timezone=True), nullable=True)
    passed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="purchases")
    challenge = relationship("Challenge", back_populates="purchases")
    trades = relationship("Trade", back_populates="purchase", cascade="all, delete-orphan")
    daily_snapshots = relationship("DailySnapshot", back_populates="purchase", cascade="all, delete-orphan")
    breach_logs = relationship("BreachLog", back_populates="purchase", cascade="all, delete-orphan")
