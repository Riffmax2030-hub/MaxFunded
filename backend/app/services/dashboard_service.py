"""
Dashboard aggregation service — Phase 8.
Collects live metrics, rule compliance, equity history, and performance
stats for a trader's active ChallengePurchase.
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import List, Optional, Tuple

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.challenge import Challenge, ChallengePurchase, ChallengeRule
from app.models.trading import DailySnapshot, Trade
from app.models.kyc import KYCVerification
from app.models.payout import PayoutRequest, PayoutStatus
from app.schemas.dashboard import (
    DashboardSummary,
    DailyPerformance,
    EquityPoint,
    PerformanceReport,
    RuleComplianceItem,
)


class DashboardService:
    """Aggregate trading performance and account health for the dashboard."""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def get_summary(
        self,
        db: AsyncSession,
        purchase: ChallengePurchase,
        user_kyc_status: str,
    ) -> DashboardSummary:
        """Return the full dashboard summary card for a purchase."""
        # Load relationships
        purchase = await self._load_purchase(db, purchase.id)
        if purchase is None:
            raise ValueError("Purchase not found")

        rules: Optional[ChallengeRule] = purchase.challenge.rules
        challenge: Challenge = purchase.challenge

        # ---- Profit metrics -------------------------------------------
        account_size = Decimal(str(challenge.starting_balance))
        current_balance = Decimal(str(purchase.current_balance))
        current_equity = Decimal(str(purchase.current_equity))

        total_profit = current_balance - account_size
        total_profit_pct = (
            float(total_profit / account_size * 100) if account_size else 0.0
        )

        # ---- Drawdown metrics -----------------------------------------
        daily_dd_limit = float(rules.max_daily_loss_percentage) if rules else 5.0
        max_dd_limit = float(rules.max_drawdown_percentage) if rules else 10.0

        daily_starting = Decimal(str(purchase.daily_starting_equity))
        high_water = Decimal(str(purchase.high_water_mark or account_size))

        daily_dd_used = 0.0
        if daily_starting > 0:
            daily_dd_used = float(
                max(Decimal("0"), daily_starting - current_equity)
                / account_size
                * 100
            )

        max_dd_used = 0.0
        if high_water > 0:
            max_dd_used = float(
                max(Decimal("0"), high_water - current_equity)
                / account_size
                * 100
            )

        # ---- Profit target metrics ------------------------------------
        profit_target_pct = float(rules.profit_target_percentage) if rules else 10.0
        profit_target_abs = account_size * Decimal(str(profit_target_pct)) / 100
        profit_target_reached_pct = min(
            100.0,
            float(max(Decimal("0"), total_profit) / profit_target_abs * 100)
            if profit_target_abs
            else 0.0,
        )
        profit_target_achieved = total_profit >= profit_target_abs

        # ---- Trade stats ----------------------------------------------
        trades = purchase.trades
        closed_trades = [t for t in trades if t.status == "CLOSED"]
        winning = [t for t in closed_trades if Decimal(str(t.profit)) > 0]
        losing = [t for t in closed_trades if Decimal(str(t.profit)) <= 0]

        total_trades = len(closed_trades)
        win_rate_pct = (len(winning) / total_trades * 100) if total_trades else 0.0

        gross_profit = sum(Decimal(str(t.profit)) for t in winning) or Decimal("0")
        gross_loss = abs(sum(Decimal(str(t.profit)) for t in losing)) or Decimal("0")

        avg_profit = gross_profit / len(winning) if winning else Decimal("0")
        avg_loss = gross_loss / len(losing) if losing else Decimal("0")
        profit_factor = (
            float(gross_profit / gross_loss) if gross_loss > 0 else None
        )

        open_positions = len([t for t in trades if t.status == "OPEN"])

        # ---- Days remaining ------------------------------------------
        max_days = rules.max_trading_days if rules else None
        days_remaining: Optional[int] = None
        if max_days and purchase.created_at:
            elapsed = (date.today() - purchase.created_at.date()).days
            days_remaining = max(0, max_days - elapsed)

        # ---- KYC / Payout flags --------------------------------------
        pending_payout = await self._has_pending_payout(db, purchase.id)

        # ---- Rule compliance list ------------------------------------
        compliance = self._build_rule_compliance(
            rules,
            account_size,
            current_equity,
            daily_starting,
            high_water,
            total_profit,
            purchase.trading_days_count,
        )

        # ---- Account phase -------------------------------------------
        phase = self._derive_phase(purchase.status)

        return DashboardSummary(
            purchase_id=purchase.id,
            challenge_name=challenge.name,
            account_size=account_size,
            phase=phase,
            current_balance=current_balance,
            current_equity=current_equity,
            total_profit=total_profit,
            total_profit_pct=total_profit_pct,
            open_positions=open_positions,
            daily_drawdown_used_pct=round(daily_dd_used, 2),
            daily_drawdown_limit_pct=daily_dd_limit,
            max_drawdown_used_pct=round(max_dd_used, 2),
            max_drawdown_limit_pct=max_dd_limit,
            profit_target_pct=profit_target_pct,
            profit_target_reached_pct=round(profit_target_reached_pct, 2),
            profit_target_achieved=profit_target_achieved,
            total_trades=total_trades,
            winning_trades=len(winning),
            losing_trades=len(losing),
            win_rate_pct=round(win_rate_pct, 2),
            avg_profit_per_trade=avg_profit,
            avg_loss_per_trade=avg_loss,
            profit_factor=profit_factor,
            account_status=purchase.status,
            days_remaining=days_remaining,
            challenge_start_date=(
                purchase.created_at.date() if purchase.created_at else None
            ),
            kyc_status=user_kyc_status,
            has_pending_payout=pending_payout,
            mt5_server=purchase.mt5_server,
            mt5_login=purchase.mt5_login,
            mt5_password=purchase.mt5_password,
            mt5_investor_password=purchase.mt5_investor_password,
            rule_compliance=compliance,
        )

    async def get_equity_curve(
        self,
        db: AsyncSession,
        purchase_id: str,
        days: int = 30,
    ) -> List[EquityPoint]:
        """Return daily equity snapshots for the equity curve chart."""
        since = date.today() - timedelta(days=days)
        result = await db.execute(
            select(DailySnapshot)
            .where(
                DailySnapshot.purchase_id == purchase_id,
                DailySnapshot.snapshot_date >= since,
            )
            .order_by(DailySnapshot.snapshot_date)
        )
        snapshots = result.scalars().all()

        points: List[EquityPoint] = []
        prev_balance: Optional[Decimal] = None
        for snap in snapshots:
            balance = Decimal(str(snap.ending_balance))
            equity = Decimal(str(snap.ending_equity))
            daily_pnl = (balance - prev_balance) if prev_balance is not None else None
            points.append(
                EquityPoint(
                    recorded_at=snap.snapshot_date,  # type: ignore[arg-type]
                    equity=equity,
                    balance=balance,
                    daily_pnl=daily_pnl,
                )
            )
            prev_balance = balance
        return points

    async def get_performance(
        self,
        db: AsyncSession,
        purchase_id: str,
    ) -> PerformanceReport:
        """Return daily performance breakdown from DailySnapshot records."""
        result = await db.execute(
            select(DailySnapshot)
            .where(DailySnapshot.purchase_id == purchase_id)
            .order_by(DailySnapshot.snapshot_date)
        )
        snapshots = result.scalars().all()

        daily: List[DailyPerformance] = []
        prev_balance: Optional[Decimal] = None

        for snap in snapshots:
            balance = Decimal(str(snap.ending_balance))
            pnl = (balance - prev_balance) if prev_balance is not None else Decimal("0")
            daily.append(
                DailyPerformance(
                    trade_date=snap.snapshot_date,
                    realized_pnl=pnl,
                    trades_count=snap.trades_count,
                    win_count=snap.win_count if hasattr(snap, "win_count") else 0,
                )
            )
            prev_balance = balance

        trading_days = len(daily)
        best = max((d.realized_pnl for d in daily), default=None)
        worst = min((d.realized_pnl for d in daily), default=None)
        avg_pnl = (
            sum(d.realized_pnl for d in daily) / trading_days
            if trading_days
            else None
        )

        return PerformanceReport(
            purchase_id=purchase_id,
            daily_breakdown=daily,
            best_day_pnl=best,
            worst_day_pnl=worst,
            avg_daily_pnl=avg_pnl,
            trading_days=trading_days,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    async def _load_purchase(
        self, db: AsyncSession, purchase_id: str
    ) -> Optional[ChallengePurchase]:
        result = await db.execute(
            select(ChallengePurchase)
            .options(
                selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
                selectinload(ChallengePurchase.trades),
                selectinload(ChallengePurchase.daily_snapshots),
            )
            .where(ChallengePurchase.id == purchase_id)
        )
        return result.scalar_one_or_none()

    async def _has_pending_payout(self, db: AsyncSession, purchase_id: str) -> bool:
        result = await db.execute(
            select(PayoutRequest.id).where(
                PayoutRequest.purchase_id == purchase_id,
                PayoutRequest.status.in_(
                    [
                        PayoutStatus.REQUESTED,
                        PayoutStatus.UNDER_REVIEW,
                        PayoutStatus.APPROVED,
                        PayoutStatus.PROCESSING,
                    ]
                ),
            )
        )
        return result.scalar_one_or_none() is not None

    def _build_rule_compliance(
        self,
        rules: Optional[ChallengeRule],
        account_size: Decimal,
        current_equity: Decimal,
        daily_starting: Decimal,
        high_water: Decimal,
        total_profit: Decimal,
        trading_days: int,
    ) -> List[RuleComplianceItem]:
        if not rules:
            return []

        items: List[RuleComplianceItem] = []

        # Daily loss rule
        daily_loss_limit_abs = account_size * Decimal(str(rules.max_daily_loss_percentage)) / 100
        daily_loss_current = max(Decimal("0"), daily_starting - current_equity)
        daily_pct_used = (
            float(daily_loss_current / daily_loss_limit_abs * 100)
            if daily_loss_limit_abs
            else 0.0
        )
        items.append(RuleComplianceItem(
            rule_name="Daily Loss Limit",
            description=f"Max {rules.max_daily_loss_percentage}% loss per day",
            current_value=daily_loss_current,
            limit_value=daily_loss_limit_abs,
            percentage_used=round(daily_pct_used, 2),
            is_breached=daily_pct_used >= 100,
        ))

        # Max drawdown rule
        max_dd_limit_abs = account_size * Decimal(str(rules.max_drawdown_percentage)) / 100
        max_dd_current = max(Decimal("0"), high_water - current_equity)
        max_dd_pct_used = (
            float(max_dd_current / max_dd_limit_abs * 100)
            if max_dd_limit_abs
            else 0.0
        )
        items.append(RuleComplianceItem(
            rule_name="Maximum Drawdown",
            description=f"Max {rules.max_drawdown_percentage}% drawdown overall",
            current_value=max_dd_current,
            limit_value=max_dd_limit_abs,
            percentage_used=round(max_dd_pct_used, 2),
            is_breached=max_dd_pct_used >= 100,
        ))

        # Profit target rule
        profit_target_abs = account_size * Decimal(str(rules.profit_target_percentage)) / 100
        profit_pct_used = (
            float(max(Decimal("0"), total_profit) / profit_target_abs * 100)
            if profit_target_abs
            else 0.0
        )
        items.append(RuleComplianceItem(
            rule_name="Profit Target",
            description=f"Reach {rules.profit_target_percentage}% profit",
            current_value=max(Decimal("0"), total_profit),
            limit_value=profit_target_abs,
            percentage_used=round(min(100.0, profit_pct_used), 2),
            is_achieved=total_profit >= profit_target_abs,
        ))

        # Minimum trading days
        items.append(RuleComplianceItem(
            rule_name="Minimum Trading Days",
            description=f"Trade at least {rules.min_trading_days} days",
            current_value=Decimal(str(trading_days)),
            limit_value=Decimal(str(rules.min_trading_days)),
            percentage_used=round(
                min(100.0, trading_days / rules.min_trading_days * 100)
                if rules.min_trading_days
                else 100.0,
                2,
            ),
            is_achieved=trading_days >= rules.min_trading_days,
        ))

        return items

    def _derive_phase(self, status: str) -> str:
        funded_statuses = {"FUNDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID"}
        passed_statuses = {"PASSED", "UNDER_REVIEW"}
        if status in funded_statuses:
            return "FUNDED"
        if status in passed_statuses:
            return "PHASE_2"
        return "PHASE_1"
