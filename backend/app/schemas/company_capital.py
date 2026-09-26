from __future__ import annotations
from decimal import Decimal
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from app.models.company_capital import (
    BrokerType,
    BrokerConnectionStatus,
    AllocationStatus,
)


# ─────────────────────────────────────────────────────────────
# Broker Account
# ─────────────────────────────────────────────────────────────

class BrokerAccountSchema(BaseModel):
    id: str
    broker_name: str
    broker_type: BrokerType
    account_number: str
    server_address: Optional[str]
    currency: str
    balance: Decimal
    equity: Decimal
    margin_used: Decimal
    free_margin: Decimal
    max_capital_allocation: Decimal
    current_allocation: Decimal
    status: BrokerConnectionStatus
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AdminCreateBrokerRequest(BaseModel):
    broker_name: str = Field(..., min_length=2, max_length=100)
    broker_type: BrokerType = BrokerType.SIMULATED_TESTNET
    account_number: str = Field(..., min_length=2, max_length=64)
    server_address: Optional[str] = None
    currency: str = Field("USD", max_length=10)
    balance: Decimal = Field(Decimal("1000000.00"), ge=Decimal("0"))
    max_capital_allocation: Decimal = Field(Decimal("500000.00"), ge=Decimal("0"))
    api_credentials: Dict[str, Any] = Field(default_factory=dict)


# ─────────────────────────────────────────────────────────────
# Trader Signal Profile
# ─────────────────────────────────────────────────────────────

class SignalProfileSchema(BaseModel):
    id: str
    purchase_id: str
    user_id: str
    signal_score: Decimal
    win_rate_percentage: Decimal
    profit_factor: Decimal
    sharpe_ratio: Decimal
    max_adverse_excursion: Decimal
    total_trades_analyzed: int
    consistency_rating: str
    is_eligible_for_copy: bool
    recommended_lot_multiplier: Decimal
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Allocation Strategy
# ─────────────────────────────────────────────────────────────

class AllocationStrategySchema(BaseModel):
    id: str
    name: str
    description: Optional[str]
    broker_account_id: str
    min_signal_score: Decimal
    max_allocated_capital: Decimal
    lot_multiplier: Decimal
    max_daily_loss_limit: Decimal
    stop_loss_required: bool
    status: AllocationStatus
    allowed_symbols: List[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class AdminCreateStrategyRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    broker_account_id: str
    min_signal_score: Decimal = Field(Decimal("80.00"), ge=Decimal("0"), le=Decimal("100"))
    max_allocated_capital: Decimal = Field(Decimal("100000.00"), ge=Decimal("0"))
    lot_multiplier: Decimal = Field(Decimal("0.50"), ge=Decimal("0.01"), le=Decimal("10.00"))
    max_daily_loss_limit: Decimal = Field(Decimal("25000.00"), ge=Decimal("0"))
    stop_loss_required: bool = True
    allowed_symbols: List[str] = Field(
        default_factory=lambda: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "US30", "NAS100"]
    )


class AdminUpdateStrategyStatusRequest(BaseModel):
    status: AllocationStatus


# ─────────────────────────────────────────────────────────────
# Order Execution
# ─────────────────────────────────────────────────────────────

class OrderExecutionSchema(BaseModel):
    id: str
    broker_account_id: str
    strategy_id: Optional[str]
    source_purchase_id: Optional[str]
    broker_ticket: str
    symbol: str
    side: str
    executed_lots: Decimal
    open_price: Decimal
    close_price: Optional[Decimal]
    open_time: datetime
    close_time: Optional[datetime]
    realized_profit: Decimal
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Leaderboard Entry
# ─────────────────────────────────────────────────────────────

class SignalLeaderboardEntry(BaseModel):
    rank: int
    purchase_id: str
    user_id: str
    signal_score: Decimal
    win_rate_percentage: Decimal
    profit_factor: Decimal
    consistency_rating: str
    is_eligible_for_copy: bool
    total_trades_analyzed: int
