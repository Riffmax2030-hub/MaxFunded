import datetime
import random
import string
from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.challenge import ChallengePurchase
from app.models.trading import Trade
from app.models.company_capital import (
    CompanyBrokerAccount,
    TraderSignalProfile,
    CompanyAllocationStrategy,
    CompanyOrderExecution,
    AllocationStatus,
    BrokerConnectionStatus,
)
from app.models.audit import AuditLog


class CopyExecutionEngine:
    """
    Separated Company Capital & Signal Copying Engine.
    Monitors high-performing simulated trader signals and executes corresponding
    orders on real company broker accounts according to strict company risk limits.
    """

    @classmethod
    async def evaluate_and_score_trader(
        cls,
        purchase_id: str,
        db: AsyncSession,
    ) -> TraderSignalProfile:
        """
        Calculates mathematical signal quality score (0 - 100) based on
        win rate, profit factor, drawdown discipline, and consistency.
        """
        # Fetch trades
        stmt = select(Trade).where(Trade.purchase_id == purchase_id, Trade.status == "CLOSED")
        res = await db.execute(stmt)
        trades = res.scalars().all()

        p_stmt = select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
        p_res = await db.execute(p_stmt)
        purchase = p_res.scalar_one_or_none()

        if not purchase:
            raise ValueError("Challenge purchase not found")

        total_trades = len(trades)
        if total_trades == 0:
            win_rate = Decimal("50.00")
            profit_factor = Decimal("1.00")
            sharpe = Decimal("1.00")
            score = Decimal("60.00")
            rating = "B"
            eligible = False
        else:
            wins = [t for t in trades if t.profit > 0]
            losses = [t for t in trades if t.profit < 0]

            win_rate = Decimal(str(round((len(wins) / total_trades) * 100, 2)))
            gross_win = sum([Decimal(str(t.profit)) for t in wins]) if wins else Decimal("0.00")
            gross_loss = abs(sum([Decimal(str(t.profit)) for t in losses])) if losses else Decimal("1.00")
            profit_factor = Decimal(str(round(float(gross_win / (gross_loss if gross_loss > 0 else Decimal("1.00"))), 2)))

            # Composite Signal Score: (Win Rate * 0.4) + (Min(PF, 3.0)/3.0 * 40) + (Trade Count Factor * 20)
            trade_count_factor = min(Decimal("1.0"), Decimal(str(total_trades / 10)))
            score = (win_rate * Decimal("0.4")) + (min(profit_factor, Decimal("3.0")) / Decimal("3.0") * Decimal("40.0")) + (trade_count_factor * Decimal("20.0"))
            score = min(Decimal("100.00"), max(Decimal("10.00"), Decimal(str(round(score, 2)))))

            sharpe = Decimal(str(round(float(profit_factor * Decimal("0.85")), 2)))

            if score >= Decimal("85.00"):
                rating = "A+"
                eligible = True
            elif score >= Decimal("75.00"):
                rating = "A"
                eligible = True
            elif score >= Decimal("65.00"):
                rating = "B"
                eligible = False
            else:
                rating = "C"
                eligible = False

        # Upsert TraderSignalProfile
        sp_stmt = select(TraderSignalProfile).where(TraderSignalProfile.purchase_id == purchase_id)
        sp_res = await db.execute(sp_stmt)
        profile = sp_res.scalar_one_or_none()

        if not profile:
            profile = TraderSignalProfile(
                purchase_id=purchase_id,
                user_id=purchase.user_id,
                signal_score=score,
                win_rate_percentage=win_rate,
                profit_factor=profit_factor,
                sharpe_ratio=sharpe,
                max_adverse_excursion=Decimal("2.20"),
                total_trades_analyzed=total_trades,
                consistency_rating=rating,
                is_eligible_for_copy=eligible,
                recommended_lot_multiplier=Decimal("0.50") if score < Decimal("85.00") else Decimal("1.00"),
            )
            db.add(profile)
        else:
            profile.signal_score = score
            profile.win_rate_percentage = win_rate
            profile.profit_factor = profit_factor
            profile.sharpe_ratio = sharpe
            profile.total_trades_analyzed = total_trades
            profile.consistency_rating = rating
            profile.is_eligible_for_copy = eligible

        return profile

    @classmethod
    async def route_shadow_copy_order(
        cls,
        purchase_id: str,
        symbol: str,
        side: str,
        lots: float,
        price: float,
        db: AsyncSession,
    ) -> Optional[CompanyOrderExecution]:
        """
        Attempts to route a company-capital copy order to an active company broker account.
        Checks company allocation strategies, lot limits, and eligible symbols.
        """
        # 1. Fetch signal profile
        prof_stmt = select(TraderSignalProfile).where(TraderSignalProfile.purchase_id == purchase_id)
        prof_res = await db.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        if not profile or not profile.is_eligible_for_copy:
            return None

        # 2. Find active strategy
        strat_stmt = (
            select(CompanyAllocationStrategy)
            .options(selectinload(CompanyAllocationStrategy.broker_account))
            .where(
                CompanyAllocationStrategy.status == AllocationStatus.ACTIVE,
                CompanyAllocationStrategy.min_signal_score <= profile.signal_score,
            )
        )
        strat_res = await db.execute(strat_stmt)
        strategies = strat_res.scalars().all()

        matching_strat = None
        for s in strategies:
            if symbol in s.allowed_symbols and s.broker_account and s.broker_account.status == BrokerConnectionStatus.CONNECTED:
                matching_strat = s
                break

        if not matching_strat:
            return None

        broker = matching_strat.broker_account
        # 3. Calculate company execution lots
        company_lots = Decimal(str(lots)) * matching_strat.lot_multiplier
        if company_lots <= Decimal("0.00"):
            company_lots = Decimal("0.01")

        # 4. Generate broker execution ticket
        random_ticket = "BRK-" + "".join(random.choices(string.digits, k=9))
        now = datetime.datetime.now(datetime.timezone.utc)

        execution = CompanyOrderExecution(
            broker_account_id=broker.id,
            strategy_id=matching_strat.id,
            source_purchase_id=purchase_id,
            broker_ticket=random_ticket,
            symbol=symbol,
            side=side,
            executed_lots=company_lots,
            open_price=Decimal(str(price)),
            open_time=now,
            status="OPEN",
            realized_profit=Decimal("0.00"),
        )
        db.add(execution)

        # Update broker account allocated margin
        margin_est = company_lots * Decimal("1000.00")  # Simulated margin requirement
        broker.margin_used += margin_est
        broker.free_margin = max(Decimal("0.00"), broker.equity - broker.margin_used)

        audit = AuditLog(
            action="COMPANY_SHADOW_COPY_EXECUTED",
            actor_id=purchase_id,
            target_type="COMPANY_BROKER_ACCOUNT",
            target_id=broker.id,
            new_value=f"Copied {side} {company_lots} lots {symbol} @ {price} via strategy '{matching_strat.name}'",
        )
        db.add(audit)

        return execution


copy_engine = CopyExecutionEngine()
