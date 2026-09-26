"""
Pydantic schemas for the Trader Dashboard API — Phase 8.
Aggregates real-time metrics, equity curve, rule compliance, and account health.
"""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Rule compliance snapshot
# ---------------------------------------------------------------------------

class RuleComplianceItem(BaseModel):
    rule_name: str
    description: str
    current_value: Optional[Decimal] = None
    limit_value: Optional[Decimal] = None
    percentage_used: Optional[float] = None   # 0-100
    is_breached: bool = False
    is_achieved: bool = False                  # for profit target

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Equity curve point
# ---------------------------------------------------------------------------

class EquityPoint(BaseModel):
    recorded_at: datetime
    equity: Decimal
    balance: Decimal
    daily_pnl: Optional[Decimal] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Dashboard summary (main card data)
# ---------------------------------------------------------------------------

class DashboardSummary(BaseModel):
    # Account identification
    purchase_id: str
    challenge_name: str
    account_size: Decimal
    phase: str                         # "PHASE_1", "PHASE_2", "FUNDED"

    # Live metrics
    current_balance: Decimal
    current_equity: Decimal
    total_profit: Decimal
    total_profit_pct: float
    open_positions: int

    # Drawdown metrics
    daily_drawdown_used_pct: float     # 0-100
    daily_drawdown_limit_pct: float
    max_drawdown_used_pct: float
    max_drawdown_limit_pct: float

    # Profit targets
    profit_target_pct: float
    profit_target_reached_pct: float   # how far along (0-100)
    profit_target_achieved: bool

    # Trade stats
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_pct: float
    avg_profit_per_trade: Decimal
    avg_loss_per_trade: Decimal
    profit_factor: Optional[float] = None

    # Status
    account_status: str                # "ACTIVE", "BREACHED", "PASSED", "FUNDED"
    days_remaining: Optional[int] = None
    challenge_start_date: Optional[date] = None

    # KYC / payout quick links
    kyc_status: str
    has_pending_payout: bool

    # Compliance rules
    rule_compliance: List[RuleComplianceItem] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Performance breakdown
# ---------------------------------------------------------------------------

class DailyPerformance(BaseModel):
    trade_date: date
    realized_pnl: Decimal
    trades_count: int
    win_count: int

    model_config = {"from_attributes": True}


class PerformanceReport(BaseModel):
    purchase_id: str
    daily_breakdown: List[DailyPerformance] = Field(default_factory=list)
    best_day_pnl: Optional[Decimal] = None
    worst_day_pnl: Optional[Decimal] = None
    avg_daily_pnl: Optional[Decimal] = None
    trading_days: int = 0

    model_config = {"from_attributes": True}
