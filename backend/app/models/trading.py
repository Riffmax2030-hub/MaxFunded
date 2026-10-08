from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
    Date,
    Text,
    func,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Trade(BaseModel):
    __tablename__ = "trades"

    purchase_id = Column(
        String(36),
        ForeignKey("challenge_purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket = Column(String(64), nullable=False, unique=True, index=True)
    symbol = Column(String(30), nullable=False, index=True)
    trade_type = Column(String(10), nullable=False)  # BUY or SELL
    lots = Column(Numeric(10, 2), nullable=False)
    open_price = Column(Numeric(18, 5), nullable=False)
    close_price = Column(Numeric(18, 5), nullable=True)
    stop_loss = Column(Numeric(18, 5), nullable=True)
    take_profit = Column(Numeric(18, 5), nullable=True)
    open_time = Column(DateTime(timezone=True), nullable=False)
    close_time = Column(DateTime(timezone=True), nullable=True)
    profit = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    commission = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    swap = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    status = Column(String(20), default="OPEN", index=True, nullable=False)  # OPEN or CLOSED

    purchase = relationship("ChallengePurchase", back_populates="trades")


class DailySnapshot(BaseModel):
    __tablename__ = "daily_snapshots"

    purchase_id = Column(
        String(36),
        ForeignKey("challenge_purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    snapshot_date = Column(Date, nullable=False, index=True)
    starting_balance = Column(Numeric(18, 4), nullable=False)
    starting_equity = Column(Numeric(18, 4), nullable=False)
    ending_balance = Column(Numeric(18, 4), nullable=False)
    ending_equity = Column(Numeric(18, 4), nullable=False)
    high_equity = Column(Numeric(18, 4), nullable=False)
    low_equity = Column(Numeric(18, 4), nullable=False)
    trades_count = Column(Integer, default=0, nullable=False)
    daily_profit = Column(Numeric(18, 4), default=Decimal("0.00"), nullable=False)
    is_trading_day = Column(Boolean, default=False, nullable=False)

    purchase = relationship("ChallengePurchase", back_populates="daily_snapshots")


class BreachLog(BaseModel):
    __tablename__ = "breach_logs"

    purchase_id = Column(
        String(36),
        ForeignKey("challenge_purchases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rule_name = Column(String(50), nullable=False)  # MAX_DAILY_LOSS, MAX_DRAWDOWN, PROHIBITED_STRATEGY
    breached_value = Column(Numeric(18, 4), nullable=False)
    threshold_value = Column(Numeric(18, 4), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    purchase = relationship("ChallengePurchase", back_populates="breach_logs")


class MT5AccountPool(BaseModel):
    __tablename__ = "mt5_account_pool"

    broker_name = Column(String(100), default="RoboForex", nullable=False)
    server_name = Column(String(100), default="RoboForex-Demo", nullable=False)
    account_tier = Column(Numeric(18, 2), nullable=False, index=True)  # e.g. 10000, 25000, 50000, 100000, 200000
    mt5_login = Column(String(64), unique=True, nullable=False, index=True)
    mt5_password = Column(String(128), nullable=False)
    mt5_investor_password = Column(String(128), nullable=True)
    status = Column(String(30), default="AVAILABLE", index=True, nullable=False)  # AVAILABLE, ASSIGNED, BREACHED, PASSED, ARCHIVED
    assigned_purchase_id = Column(
        String(36),
        ForeignKey("challenge_purchases.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
