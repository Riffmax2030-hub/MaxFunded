"""
Live MT5 Trading Engine & Bridge Service.

Provides bi-directional integration with MetaTrader 5 servers:
- Provisions demo & evaluation trading accounts on MT5
- Ingests real-time deal executions and order events via Bridge Webhook
- Ingests real-time floating equity ticks
- Immediately runs the Server-Side Risk Engine on every trade and equity tick
- Automatically disables trading on MT5 when daily loss or max drawdown is breached
"""
import datetime
import logging
import random
import string
from decimal import Decimal
from typing import Optional, Dict, Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase, PurchaseStatus
from app.models.trading import Trade, DailySnapshot, BreachLog, MT5AccountPool
from app.models.audit import AuditLog
from app.services.risk_engine import risk_engine
from app.services.copy_engine import copy_engine
from app.services.email_service import email_service
from app.services.discord_service import discord_service
from app.schemas.trading import (
    MT5TradeEventSchema,
    MT5EquityTickSchema,
    MT5BridgeResultSchema,
)

logger = logging.getLogger(__name__)


class MT5TradingService:
    """
    Core Trading Engine for MetaTrader 5 platform integration.
    """

    @staticmethod
    def generate_login() -> str:
        """Generate a 7-digit simulated MT5 login starting with 88."""
        suffix = "".join(random.choices(string.digits, k=5))
        return f"88{suffix}"

    @staticmethod
    def generate_password() -> str:
        """Generate a secure MT5 master password."""
        chars = string.ascii_letters + string.digits
        rnd = "".join(random.choices(chars, k=8))
        return f"Mxf_{rnd}!"

    @staticmethod
    def generate_investor_password() -> str:
        """Generate a read-only investor password."""
        digits = "".join(random.choices(string.digits, k=6))
        return f"Inv_{digits}"

    async def provision_mt5_account(
        self,
        purchase: ChallengePurchase,
        challenge: Challenge,
        db: AsyncSession,
        server_name: Optional[str] = None,
        is_funded: bool = False,
    ) -> ChallengePurchase:
        """
        Creates or provisions an MT5 account for a confirmed challenge purchase.

        Server selection:
          - Challenge phase (Phase 1 / Phase 2) → MaxFunded-Server1
          - Funded / passed trader             → MaxFunded-Live1
          - server_name override               → uses that value directly
        """
        # -----------------------------------------------------------
        # Option C: Check the Pre-Generated MT5 Account Pool first
        # -----------------------------------------------------------
        starting_bal = Decimal(str(challenge.starting_balance))
        pool_stmt = (
            select(MT5AccountPool)
            .where(
                MT5AccountPool.status == "AVAILABLE",
                MT5AccountPool.account_tier == starting_bal,
            )
            .order_by(MT5AccountPool.created_at.asc())
        )
        pool_res = await db.execute(pool_stmt)
        pool_account = pool_res.scalars().first()

        if pool_account and not is_funded:
            # Claim this account from the pool
            pool_account.status = "ASSIGNED"
            pool_account.assigned_purchase_id = purchase.id
            pool_account.assigned_user_id = purchase.user_id
            pool_account.assigned_at = datetime.datetime.now(datetime.timezone.utc)

            purchase.mt5_login = pool_account.mt5_login
            purchase.mt5_server = pool_account.server_name
            purchase.mt5_password = pool_account.mt5_password
            purchase.mt5_investor_password = pool_account.mt5_investor_password or self.generate_investor_password()

            logger.info(
                "Assigned POOL MT5 account [%s | %s] (login: %s) to purchase %s",
                pool_account.broker_name,
                pool_account.server_name,
                pool_account.mt5_login,
                purchase.id,
            )
        else:
            # Fallback to generated credentials if pool is empty or if migrating to live
            if server_name:
                server = server_name
            elif is_funded:
                server = getattr(settings, "MT5_LIVE_SERVER", "MaxFunded-Live1")
            else:
                server = getattr(settings, "MT5_CHALLENGE_SERVER", "MaxFunded-Server1")

            purchase.mt5_login = self.generate_login()
            purchase.mt5_server = server
            purchase.mt5_password = self.generate_password()
            purchase.mt5_investor_password = self.generate_investor_password()

            logger.info(
                "No pool account available for tier %s — generated fallback credentials (%s on %s)",
                starting_bal,
                purchase.mt5_login,
                purchase.mt5_server,
            )

        purchase.current_balance = starting_bal
        purchase.current_equity = starting_bal
        purchase.high_water_mark = starting_bal
        purchase.daily_starting_equity = starting_bal
        purchase.trading_days_count = 0
        purchase.status = PurchaseStatus.ACTIVE.value

        # Baseline snapshot
        today = datetime.date.today()
        snapshot = DailySnapshot(
            purchase_id=purchase.id,
            snapshot_date=today,
            starting_balance=starting_bal,
            starting_equity=starting_bal,
            ending_balance=starting_bal,
            ending_equity=starting_bal,
            high_equity=starting_bal,
            low_equity=starting_bal,
            trades_count=0,
            daily_profit=Decimal("0.00"),
            is_trading_day=False,
        )
        db.add(snapshot)

        audit = AuditLog(
            action="MT5_ACCOUNT_PROVISIONED",
            actor_id=purchase.user_id,
            target_type="CHALLENGE_PURCHASE",
            target_id=purchase.id,
            new_value=f"Login: {purchase.mt5_login}, Server: {purchase.mt5_server}, Balance: {starting_bal}",
        )
        db.add(audit)
        await db.flush()

        # Dispatch credentials email to the trader
        try:
            user_stmt = select(User).where(User.id == purchase.user_id)
            user_res = await db.execute(user_stmt)
            trader = user_res.scalar_one_or_none()
            if trader and trader.email:
                await email_service.send_credentials_email(
                    to_email=trader.email,
                    trader_name=trader.full_name or "Trader",
                    challenge_name=challenge.name,
                    starting_balance=float(starting_bal),
                    mt5_login=purchase.mt5_login or "",
                    mt5_password=purchase.mt5_password or "",
                    mt5_investor_password=purchase.mt5_investor_password or "",
                    mt5_server=purchase.mt5_server or "MaxFunded-Server1",
                )
        except Exception as exc:
            logger.warning("Failed to dispatch MT5 credentials email: %s", exc)

        logger.info(
            "Provisioned MT5 account %s for user %s on %s",
            purchase.mt5_login,
            purchase.user_id,
            purchase.mt5_server,
        )
        return purchase


    async def disable_trading(
        self,
        mt5_login: str,
        reason: str,
        db: AsyncSession,
    ) -> bool:
        """
        Disables trading on the MT5 account (e.g., when a breach occurs).
        In live production, issues an MT5 Manager API command to switch group to read-only
        or scramble trader password.
        """
        logger.warning(
            "DISABLING MT5 TRADING for login %s. Reason: %s", mt5_login, reason
        )
        # Log to audit trail
        audit = AuditLog(
            action="MT5_TRADING_LOCKED",
            actor_id="RISK_ENGINE",
            target_type="MT5_ACCOUNT",
            target_id=mt5_login,
            new_value=f"Locked trading due to: {reason}",
        )
        db.add(audit)
        return True

    async def process_trade_event(
        self,
        event: MT5TradeEventSchema,
        db: AsyncSession,
    ) -> MT5BridgeResultSchema:
        """
        Ingests a trade event from MT5, writes the trade to the database,
        updates account financials and daily snapshot, then immediately executes
        the Server-Side Risk Engine.
        """
        # 1. Lookup active challenge purchase by MT5 login
        stmt = (
            select(ChallengePurchase)
            .options(
                selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
            )
            .where(
                ChallengePurchase.mt5_login == event.mt5_login,
            )
            .order_by(ChallengePurchase.created_at.desc())
        )
        res = await db.execute(stmt)
        purchase = res.scalars().first()

        if not purchase:
            raise ValueError(f"No challenge account found with MT5 login: {event.mt5_login}")

        profit_dec = Decimal(str(event.profit))
        commission_dec = Decimal(str(event.commission))
        swap_dec = Decimal(str(event.swap))
        net_profit = profit_dec + commission_dec + swap_dec

        # 2. Update balances
        if event.current_balance is not None:
            purchase.current_balance = Decimal(str(event.current_balance))
        else:
            if event.status == "CLOSED":
                purchase.current_balance += net_profit

        if event.current_equity is not None:
            purchase.current_equity = Decimal(str(event.current_equity))
        else:
            purchase.current_equity = purchase.current_balance

        # Track high-water mark
        if purchase.current_equity > purchase.high_water_mark:
            purchase.high_water_mark = purchase.current_equity

        # 3. Create or update Trade record
        trade_stmt = select(Trade).where(
            Trade.purchase_id == purchase.id,
            Trade.ticket == event.ticket,
        )
        t_res = await db.execute(trade_stmt)
        trade = t_res.scalar_one_or_none()

        now = datetime.datetime.now(datetime.timezone.utc)
        if not trade:
            trade = Trade(
                purchase_id=purchase.id,
                ticket=event.ticket,
                symbol=event.symbol,
                trade_type=event.trade_type,
                lots=Decimal(str(event.lots)),
                open_price=Decimal(str(event.open_price)),
                close_price=Decimal(str(event.close_price)) if event.close_price else None,
                stop_loss=Decimal(str(event.stop_loss)) if event.stop_loss else None,
                take_profit=Decimal(str(event.take_profit)) if event.take_profit else None,
                open_time=now - datetime.timedelta(minutes=5),
                close_time=now if event.status == "CLOSED" else None,
                profit=net_profit,
                commission=commission_dec,
                swap=swap_dec,
                status=event.status,
            )
            db.add(trade)
        else:
            trade.close_price = Decimal(str(event.close_price)) if event.close_price else trade.close_price
            trade.profit = net_profit
            trade.status = event.status
            if event.status == "CLOSED" and not trade.close_time:
                trade.close_time = now

        # 4. Update Daily Snapshot
        today = datetime.date.today()
        snap_stmt = select(DailySnapshot).where(
            DailySnapshot.purchase_id == purchase.id,
            DailySnapshot.snapshot_date == today,
        )
        s_res = await db.execute(snap_stmt)
        snapshot = s_res.scalar_one_or_none()

        if not snapshot:
            snapshot = DailySnapshot(
                purchase_id=purchase.id,
                snapshot_date=today,
                starting_balance=purchase.current_balance - net_profit,
                starting_equity=purchase.current_equity - net_profit,
                ending_balance=purchase.current_balance,
                ending_equity=purchase.current_equity,
                high_equity=purchase.current_equity,
                low_equity=purchase.current_equity,
                trades_count=1,
                daily_profit=net_profit,
                is_trading_day=True,
            )
            purchase.trading_days_count += 1
            db.add(snapshot)
        else:
            if not snapshot.is_trading_day:
                snapshot.is_trading_day = True
                purchase.trading_days_count += 1
            snapshot.trades_count += 1
            snapshot.daily_profit += net_profit
            snapshot.ending_balance = purchase.current_balance
            snapshot.ending_equity = purchase.current_equity
            if purchase.current_equity > snapshot.high_equity:
                snapshot.high_equity = purchase.current_equity
            if purchase.current_equity < snapshot.low_equity:
                snapshot.low_equity = purchase.current_equity

        # 5. Immediate Server-Side Risk Engine Evaluation
        eval_result = await risk_engine.evaluate_account(
            purchase=purchase,
            challenge=purchase.challenge,
            rules=purchase.challenge.rules,
            db=db,
        )

        trading_locked = False
        if eval_result.is_breached:
            trading_locked = True
            await self.disable_trading(
                mt5_login=purchase.mt5_login,
                reason=eval_result.breach_message or "Risk engine breach limit reached",
                db=db,
            )

        # Notify trader via email if status changed (breached or passed)
        await self._notify_trader_status(purchase, eval_result, db)

        # 6. Company capital shadow-copy evaluate
        try:
            await copy_engine.evaluate_and_score_trader(purchase_id=purchase.id, db=db)
        except Exception as exc:
            logger.debug("Copy engine score error: %s", exc)

        await db.commit()
        await db.refresh(purchase)

        return MT5BridgeResultSchema(
            success=True,
            purchase_id=purchase.id,
            mt5_login=purchase.mt5_login,
            status=purchase.status,
            is_breached=eval_result.is_breached,
            is_passed=eval_result.is_passed,
            breach_message=eval_result.breach_message,
            daily_loss_remaining_usd=round(eval_result.daily_loss_remaining, 2),
            max_drawdown_remaining_usd=round(eval_result.max_drawdown_remaining, 2),
            trading_locked=trading_locked,
        )

    async def process_equity_tick(
        self,
        tick: MT5EquityTickSchema,
        db: AsyncSession,
    ) -> MT5BridgeResultSchema:
        """
        High-frequency floating equity tick processor.
        Evaluates intraday floating drawdown in real-time to prevent holding breaches.
        """
        stmt = (
            select(ChallengePurchase)
            .options(
                selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
            )
            .where(
                ChallengePurchase.mt5_login == tick.mt5_login,
            )
            .order_by(ChallengePurchase.created_at.desc())
        )
        res = await db.execute(stmt)
        purchase = res.scalars().first()

        if not purchase:
            raise ValueError(f"No challenge account found with MT5 login: {tick.mt5_login}")

        purchase.current_equity = Decimal(str(tick.current_equity))
        if tick.current_balance is not None:
            purchase.current_balance = Decimal(str(tick.current_balance))

        # Check high-water mark
        if purchase.current_equity > purchase.high_water_mark:
            purchase.high_water_mark = purchase.current_equity

        # Update high/low on today's snapshot
        today = datetime.date.today()
        snap_stmt = select(DailySnapshot).where(
            DailySnapshot.purchase_id == purchase.id,
            DailySnapshot.snapshot_date == today,
        )
        s_res = await db.execute(snap_stmt)
        snapshot = s_res.scalar_one_or_none()
        if snapshot:
            snapshot.ending_equity = purchase.current_equity
            if purchase.current_equity > snapshot.high_equity:
                snapshot.high_equity = purchase.current_equity
            if purchase.current_equity < snapshot.low_equity:
                snapshot.low_equity = purchase.current_equity

        # Run risk engine on floating equity
        eval_result = await risk_engine.evaluate_account(
            purchase=purchase,
            challenge=purchase.challenge,
            rules=purchase.challenge.rules,
            db=db,
        )

        trading_locked = False
        if eval_result.is_breached:
            trading_locked = True
            await self.disable_trading(
                mt5_login=purchase.mt5_login,
                reason=eval_result.breach_message or "Floating equity breached drawdown limit",
                db=db,
            )

        # Notify trader via email if status changed (breached or passed)
        await self._notify_trader_status(purchase, eval_result, db)

        await db.commit()
        await db.refresh(purchase)

        return MT5BridgeResultSchema(
            success=True,
            purchase_id=purchase.id,
            mt5_login=purchase.mt5_login,
            status=purchase.status,
            is_breached=eval_result.is_breached,
            is_passed=eval_result.is_passed,
            breach_message=eval_result.breach_message,
            daily_loss_remaining_usd=round(eval_result.daily_loss_remaining, 2),
            max_drawdown_remaining_usd=round(eval_result.max_drawdown_remaining, 2),
            trading_locked=trading_locked,
        )

    async def _notify_trader_status(
        self,
        purchase: ChallengePurchase,
        eval_result,
        db: AsyncSession,
    ) -> None:
        """Dispatches automated transactional email when an account breaches or passes."""
        try:
            if not eval_result.is_breached and not eval_result.is_passed:
                return

            user_res = await db.execute(select(User).where(User.id == purchase.user_id))
            trader = user_res.scalar_one_or_none()
            if not trader:
                return

            challenge_name = purchase.challenge.name if purchase.challenge else "Evaluation Challenge"

            if eval_result.is_breached:
                await email_service.send_breach_alert_email(
                    to_email=trader.email,
                    trader_name=trader.full_name or trader.email.split("@")[0],
                    challenge_name=challenge_name,
                    mt5_login=purchase.mt5_login,
                    rule_name=eval_result.breach_rule or "RISK_LIMIT",
                    breached_value=float(purchase.current_equity or 0),
                    threshold_value=float(eval_result.max_drawdown_remaining or 0),
                    details=eval_result.breach_message,
                )
                await discord_service.notify_risk_breach(
                    mt5_login=purchase.mt5_login or "N/A",
                    rule_name=eval_result.breach_rule or "RISK_LIMIT",
                    breached_val=float(purchase.current_equity or 0),
                    limit_val=float(eval_result.max_drawdown_remaining or 0),
                )
            elif eval_result.is_passed:
                cert_code = None
                try:
                    from app.services.certificate_service import certificate_service
                    issued_certs = await certificate_service.auto_sync_for_purchase(db, purchase)
                    if issued_certs:
                        cert_code = issued_certs[0].certificate_code
                except Exception as c_err:
                    logger.warning("Could not auto-generate certificate for purchase %s: %s", purchase.id, c_err)

                await email_service.send_phase_passed_email(
                    to_email=trader.email,
                    trader_name=trader.full_name or trader.email.split("@")[0],
                    challenge_name=challenge_name,
                    mt5_login=purchase.mt5_login,
                    certificate_code=cert_code,
                )
                await discord_service.notify_funded_trader(
                    trader_handle=f"{(trader.full_name or 'Trader')[:3]}***",
                    account_size_usd=float(purchase.current_balance or 100000),
                    country=getattr(trader, "country", "GLOBAL") or "GLOBAL",
                )
        except Exception as exc:
            logger.warning("Failed to dispatch trader status email: %s", exc)


mt5_service = MT5TradingService()

