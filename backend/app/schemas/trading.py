from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AccountMetricsSchema(BaseModel):
    purchase_id: str
    challenge_id: str
    challenge_name: str
    starting_balance: float
    current_balance: float
    current_equity: float
    high_water_mark: float
    daily_starting_equity: float
    status: str
    mt5_login: Optional[str] = None
    mt5_server: Optional[str] = None
    mt5_password: Optional[str] = None
    mt5_investor_password: Optional[str] = None
    leverage: int = 100

    # Risk Engine calculated limits
    daily_loss_floor: float
    daily_loss_remaining_usd: float
    daily_loss_percent_remaining: float
    max_drawdown_floor: float
    max_drawdown_remaining_usd: float
    max_drawdown_percent_remaining: float
    profit_target_amount: float
    profit_target_distance_usd: float
    profit_target_progress_percent: float

    # Constraints
    trading_days_completed: int
    trading_days_required: int
    breached_reason: Optional[str] = None
    breached_at: Optional[datetime] = None
    passed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TradeSchema(BaseModel):
    id: str
    ticket: str
    symbol: str
    trade_type: str
    lots: float
    open_price: float
    close_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    open_time: datetime
    close_time: Optional[datetime] = None
    profit: float
    commission: float
    swap: float
    status: str

    model_config = ConfigDict(from_attributes=True)


class DailySnapshotSchema(BaseModel):
    id: str
    snapshot_date: date
    starting_balance: float
    starting_equity: float
    ending_balance: float
    ending_equity: float
    high_equity: float
    low_equity: float
    trades_count: int
    daily_profit: float
    is_trading_day: bool

    model_config = ConfigDict(from_attributes=True)


class SimulateTradeRequest(BaseModel):
    symbol: str = "EURUSD"
    trade_type: str = "BUY"  # BUY or SELL
    lots: float = 1.00
    open_price: float = 1.08500
    close_price: Optional[float] = 1.08700
    profit: float = 200.00
    is_closed: bool = True


# ============================================================
# Live MT5 Bridge & Trade Ingestion Schemas
# ============================================================

class MT5TradeEventSchema(BaseModel):
    mt5_login: str
    ticket: str
    symbol: str
    trade_type: str  # BUY or SELL
    lots: float
    open_price: float
    close_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    profit: float
    commission: float = 0.0
    swap: float = 0.0
    current_balance: Optional[float] = None
    current_equity: Optional[float] = None
    status: str = "CLOSED"  # OPEN or CLOSED
    comment: Optional[str] = None


class MT5EquityTickSchema(BaseModel):
    mt5_login: str
    current_equity: float
    current_balance: Optional[float] = None
    margin: Optional[float] = 0.0
    free_margin: Optional[float] = 0.0


class MT5BridgeResultSchema(BaseModel):
    success: bool
    purchase_id: str
    mt5_login: str
    status: str
    is_breached: bool
    is_passed: bool
    breach_message: Optional[str] = None
    daily_loss_remaining_usd: float
    max_drawdown_remaining_usd: float
    trading_locked: bool


# ============================================================
# MT5 Pre-Generated Account Pool Schemas (Option C)
# ============================================================

class MT5AccountPoolCreate(BaseModel):
    broker_name: str = "RoboForex"
    server_name: str = "RoboForex-Demo"
    account_tier: float  # e.g. 10000, 25000, 50000, 100000, 200000
    mt5_login: str
    mt5_password: str
    mt5_investor_password: Optional[str] = None
    notes: Optional[str] = None


class MT5AccountPoolBatchCreate(BaseModel):
    accounts: List[MT5AccountPoolCreate]


class MT5AccountPoolResponse(BaseModel):
    id: str
    broker_name: str
    server_name: str
    account_tier: float
    mt5_login: str
    mt5_investor_password: Optional[str] = None
    status: str
    assigned_purchase_id: Optional[str] = None
    assigned_user_id: Optional[str] = None
    assigned_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MT5TierAvailability(BaseModel):
    tier: float
    total: int
    available: int
    assigned: int


class MT5AccountPoolSummary(BaseModel):
    total_accounts: int
    available_accounts: int
    assigned_accounts: int
    tiers: List[MT5TierAvailability]
