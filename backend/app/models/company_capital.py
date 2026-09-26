import enum
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
    Text,
    JSON,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class BrokerType(str, enum.Enum):
    MT5_BRIDGE = "MT5_BRIDGE"
    FIX_PROTOCOL = "FIX_PROTOCOL"
    PRIME_BROKER = "PRIME_BROKER"
    CRYPTO_EXCHANGE = "CRYPTO_EXCHANGE"
    SIMULATED_TESTNET = "SIMULATED_TESTNET"


class BrokerConnectionStatus(str, enum.Enum):
    CONNECTED = "CONNECTED"
    DISCONNECTED = "DISCONNECTED"
    MAINTENANCE = "MAINTENANCE"
    ERROR = "ERROR"


class AllocationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    STOPPED = "STOPPED"


class CompanyBrokerAccount(BaseModel):
    """
    Connected live broker / liquidity provider accounts holding company capital.
    Strictly isolated from retail trader evaluation accounts.
    """
    __tablename__ = "company_broker_accounts"

    broker_name = Column(String(100), nullable=False)
    broker_type = Column(SAEnum(BrokerType, name="brokertype"), default=BrokerType.SIMULATED_TESTNET, nullable=False)
    account_number = Column(String(64), nullable=False, unique=True)
    server_address = Column(String(255), nullable=True)
    currency = Column(String(10), default="USD", nullable=False)

    balance = Column(Numeric(18, 2), default=Decimal("1000000.00"), nullable=False)  # e.g. $1,000,000 company reserve
    equity = Column(Numeric(18, 2), default=Decimal("1000000.00"), nullable=False)
    margin_used = Column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    free_margin = Column(Numeric(18, 2), default=Decimal("1000000.00"), nullable=False)

    max_capital_allocation = Column(Numeric(18, 2), default=Decimal("500000.00"), nullable=False)
    current_allocation = Column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)

    status = Column(
        SAEnum(BrokerConnectionStatus, name="brokerconnectionstatus"),
        default=BrokerConnectionStatus.CONNECTED,
        nullable=False,
    )
    api_credentials = Column(JSON, default=dict, nullable=False)  # Encrypted API keys/config
    is_active = Column(Boolean, default=True, nullable=False)

    executions = relationship("CompanyOrderExecution", back_populates="broker_account", cascade="all, delete-orphan")


class TraderSignalProfile(BaseModel):
    """
    Performance assessment and signal score for a simulated trader account.
    Evaluates consistency, win rate, profit factor, and Sharpe-equivalent metrics.
    """
    __tablename__ = "trader_signal_profiles"

    purchase_id = Column(String(36), ForeignKey("challenge_purchases.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    signal_score = Column(Numeric(5, 2), default=Decimal("75.00"), nullable=False)  # 0.00 to 100.00
    win_rate_percentage = Column(Numeric(5, 2), default=Decimal("60.00"), nullable=False)
    profit_factor = Column(Numeric(6, 2), default=Decimal("1.85"), nullable=False)
    sharpe_ratio = Column(Numeric(6, 2), default=Decimal("1.60"), nullable=False)
    max_adverse_excursion = Column(Numeric(5, 2), default=Decimal("2.40"), nullable=False)  # MAE %
    total_trades_analyzed = Column(Integer, default=0, nullable=False)
    consistency_rating = Column(String(20), default="A", nullable=False)  # A+, A, B, C, D

    is_eligible_for_copy = Column(Boolean, default=False, nullable=False)
    recommended_lot_multiplier = Column(Numeric(4, 2), default=Decimal("1.00"), nullable=False)

    purchase = relationship("ChallengePurchase")
    user = relationship("User")


class CompanyAllocationStrategy(BaseModel):
    """
    Company-level risk rules governing how company capital copies signals from top simulated accounts.
    """
    __tablename__ = "company_allocation_strategies"

    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    broker_account_id = Column(String(36), ForeignKey("company_broker_accounts.id", ondelete="CASCADE"), nullable=False)

    min_signal_score = Column(Numeric(5, 2), default=Decimal("80.00"), nullable=False)
    max_allocated_capital = Column(Numeric(18, 2), default=Decimal("100000.00"), nullable=False)
    lot_multiplier = Column(Numeric(4, 2), default=Decimal("0.50"), nullable=False)  # Copy at 0.5x trader volume
    max_daily_loss_limit = Column(Numeric(18, 2), default=Decimal("25000.00"), nullable=False)
    stop_loss_required = Column(Boolean, default=True, nullable=False)

    status = Column(SAEnum(AllocationStatus, name="allocationstatus"), default=AllocationStatus.ACTIVE, nullable=False)
    allowed_symbols = Column(JSON, default=lambda: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "US30", "NAS100"], nullable=False)

    broker_account = relationship("CompanyBrokerAccount")


class CompanyOrderExecution(BaseModel):
    """
    Audit log of real trades executed on company broker accounts using company capital.
    Clearly attributed to strategy, source signal, and broker ticket.
    """
    __tablename__ = "company_order_executions"

    broker_account_id = Column(String(36), ForeignKey("company_broker_accounts.id", ondelete="CASCADE"), nullable=False)
    strategy_id = Column(String(36), ForeignKey("company_allocation_strategies.id", ondelete="SET NULL"), nullable=True)
    source_purchase_id = Column(String(36), ForeignKey("challenge_purchases.id", ondelete="SET NULL"), nullable=True)

    broker_ticket = Column(String(64), nullable=False, unique=True, index=True)
    symbol = Column(String(30), nullable=False)
    side = Column(String(10), nullable=False)  # BUY / SELL
    executed_lots = Column(Numeric(10, 2), nullable=False)
    open_price = Column(Numeric(18, 5), nullable=False)
    close_price = Column(Numeric(18, 5), nullable=True)

    open_time = Column(DateTime(timezone=True), nullable=False)
    close_time = Column(DateTime(timezone=True), nullable=True)
    realized_profit = Column(Numeric(18, 2), default=Decimal("0.00"), nullable=False)
    status = Column(String(20), default="OPEN", nullable=False)  # OPEN, CLOSED

    broker_account = relationship("CompanyBrokerAccount", back_populates="executions")
