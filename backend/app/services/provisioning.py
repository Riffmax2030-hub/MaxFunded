import datetime
import random
import string
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.challenge import Challenge, ChallengePurchase, PurchaseStatus
from app.models.trading import DailySnapshot
from app.models.audit import AuditLog


class ProvisioningService:
    """
    Automated Account Provisioning Service.
    Provisions simulated MT5 accounts, credentials, leverage, and initial snapshots
    upon confirmed challenge payment.
    """

    @staticmethod
    def generate_login() -> str:
        """Generates a 7-digit MT5 simulated login ID starting with 88."""
        random_suffix = "".join(random.choices(string.digits, k=5))
        return f"88{random_suffix}"

    @staticmethod
    def generate_password() -> str:
        """Generates a secure simulated MT5 master password."""
        chars = string.ascii_letters + string.digits
        random_part = "".join(random.choices(chars, k=8))
        return f"Rmf_{random_part}!"

    @staticmethod
    def generate_investor_password() -> str:
        """Generates a read-only investor password."""
        random_digits = "".join(random.choices(string.digits, k=6))
        return f"Inv_{random_digits}"

    @classmethod
    async def provision_account(
        cls,
        purchase: ChallengePurchase,
        challenge: Challenge,
        db: AsyncSession,
        server_name: str = "RiffMax-Simulated-MT5",
    ) -> ChallengePurchase:
        """
        Transitions purchase into ACTIVE status with generated MT5 credentials
        and initial balance/equity tracking.
        """
        purchase.mt5_login = cls.generate_login()
        purchase.mt5_server = server_name
        purchase.mt5_password = cls.generate_password()
        purchase.mt5_investor_password = cls.generate_investor_password()

        starting_bal = Decimal(str(challenge.starting_balance))
        purchase.current_balance = starting_bal
        purchase.current_equity = starting_bal
        purchase.high_water_mark = starting_bal
        purchase.daily_starting_equity = starting_bal
        purchase.trading_days_count = 0
        purchase.status = PurchaseStatus.ACTIVE

        # Create today's baseline snapshot
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

        # Audit trail
        audit = AuditLog(
            action="ACCOUNT_PROVISIONED",
            actor_id=purchase.user_id,
            target_type="CHALLENGE_PURCHASE",
            target_id=purchase.id,
            new_value=f"MT5 Login: {purchase.mt5_login}, Server: {purchase.mt5_server}, Balance: {starting_bal}",
        )
        db.add(audit)

        return purchase


provisioning_service = ProvisioningService()
