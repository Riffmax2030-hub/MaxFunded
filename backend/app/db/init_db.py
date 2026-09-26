from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base, async_engine, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.challenge import Challenge, ChallengeRule
from app.models.company_capital import (
    CompanyBrokerAccount,
    CompanyAllocationStrategy,
    BrokerType,
    BrokerConnectionStatus,
    AllocationStatus,
)


DEFAULT_CHALLENGES = [
    {
        "name": "$10,000 Evaluation Challenge",
        "slug": "10k-challenge",
        "starting_balance": Decimal("10000.00"),
        "price": Decimal("79.00"),
        "currency": "USD",
        "description": "Ideal starter tier for consistent prop traders.",
        "rules": {
            "profit_target_percentage": Decimal("10.00"),
            "max_daily_loss_percentage": Decimal("5.00"),
            "max_drawdown_percentage": Decimal("10.00"),
            "min_trading_days": 5,
            "leverage": 100,
            "profit_split_percentage": Decimal("80.00"),
        }
    },
    {
        "name": "$25,000 Evaluation Challenge",
        "slug": "25k-challenge",
        "starting_balance": Decimal("25000.00"),
        "price": Decimal("169.00"),
        "currency": "USD",
        "description": "Standard account tier for intermediate risk-managed strategies.",
        "rules": {
            "profit_target_percentage": Decimal("10.00"),
            "max_daily_loss_percentage": Decimal("5.00"),
            "max_drawdown_percentage": Decimal("10.00"),
            "min_trading_days": 5,
            "leverage": 100,
            "profit_split_percentage": Decimal("80.00"),
        }
    },
    {
        "name": "$50,000 Evaluation Challenge",
        "slug": "50k-challenge",
        "starting_balance": Decimal("50000.00"),
        "price": Decimal("299.00"),
        "currency": "USD",
        "description": "Pro challenge tier designed for proven strategies.",
        "rules": {
            "profit_target_percentage": Decimal("10.00"),
            "max_daily_loss_percentage": Decimal("5.00"),
            "max_drawdown_percentage": Decimal("10.00"),
            "min_trading_days": 5,
            "leverage": 100,
            "profit_split_percentage": Decimal("80.00"),
        }
    },
    {
        "name": "$100,000 Evaluation Challenge",
        "slug": "100k-challenge",
        "starting_balance": Decimal("100000.00"),
        "price": Decimal("499.00"),
        "currency": "USD",
        "description": "Our flagship evaluation account tier.",
        "rules": {
            "profit_target_percentage": Decimal("10.00"),
            "max_daily_loss_percentage": Decimal("5.00"),
            "max_drawdown_percentage": Decimal("10.00"),
            "min_trading_days": 5,
            "leverage": 100,
            "profit_split_percentage": Decimal("80.00"),
        }
    },
    {
        "name": "$200,000 Evaluation Challenge",
        "slug": "200k-challenge",
        "starting_balance": Decimal("200000.00"),
        "price": Decimal("949.00"),
        "currency": "USD",
        "description": "Institutional scale challenge for seasoned market operators.",
        "rules": {
            "profit_target_percentage": Decimal("10.00"),
            "max_daily_loss_percentage": Decimal("5.00"),
            "max_drawdown_percentage": Decimal("10.00"),
            "min_trading_days": 5,
            "leverage": 100,
            "profit_split_percentage": Decimal("80.00"),
        }
    }
]


async def init_db(db: AsyncSession) -> None:
    # 1. Create tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed Super Admin
    admin_email = "admin@riffmaxfunding.com"
    stmt = select(User).where(User.email == admin_email)
    admin_user = (await db.execute(stmt)).scalar_one_or_none()
    if not admin_user:
        admin_user = User(
            email=admin_email,
            hashed_password=get_password_hash("AdminSecret2026!"),
            full_name="RiffMax Super Administrator",
            country="NG",
            phone="+2348000000000",
            is_active=True,
            is_verified=True,
            is_admin=True,
            role="SUPER_ADMIN",
            kyc_status="APPROVED",
            accepted_terms=True,
            accepted_privacy=True,
            accepted_risk_disclosure=True,
        )
        db.add(admin_user)
        await db.commit()

    # 3. Seed Default Challenges
    for item in DEFAULT_CHALLENGES:
        stmt = select(Challenge).where(Challenge.slug == item["slug"])
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if not existing:
            ch = Challenge(
                name=item["name"],
                slug=item["slug"],
                starting_balance=item["starting_balance"],
                price=item["price"],
                currency=item["currency"],
                description=item["description"],
                is_active=True,
            )
            db.add(ch)
            await db.flush()

            rule_data = item["rules"]
            rules = ChallengeRule(
                challenge_id=ch.id,
                profit_target_percentage=rule_data["profit_target_percentage"],
                max_daily_loss_percentage=rule_data["max_daily_loss_percentage"],
                max_drawdown_percentage=rule_data["max_drawdown_percentage"],
                min_trading_days=rule_data["min_trading_days"],
                leverage=rule_data["leverage"],
                profit_split_percentage=rule_data["profit_split_percentage"],
            )
            db.add(rules)
    await db.commit()

    # 4. Seed Default Company Broker Account (SIMULATED_TESTNET — safe for dev/test)
    broker_stmt = select(CompanyBrokerAccount).where(
        CompanyBrokerAccount.account_number == "RIFFMAX-TESTNET-001"
    )
    default_broker = (await db.execute(broker_stmt)).scalar_one_or_none()
    if not default_broker:
        default_broker = CompanyBrokerAccount(
            broker_name="RiffMax Internal Testnet",
            broker_type=BrokerType.SIMULATED_TESTNET,
            account_number="RIFFMAX-TESTNET-001",
            server_address="testnet.riffmaxfunding.com:443",
            currency="USD",
            balance=Decimal("5000000.00"),
            equity=Decimal("5000000.00"),
            margin_used=Decimal("0.00"),
            free_margin=Decimal("5000000.00"),
            max_capital_allocation=Decimal("2000000.00"),
            current_allocation=Decimal("0.00"),
            status=BrokerConnectionStatus.CONNECTED,
            api_credentials={},  # TODO: populate real credentials in production
            is_active=True,
        )
        db.add(default_broker)
        await db.flush()

        # Seed a default active allocation strategy
        default_strategy = CompanyAllocationStrategy(
            name="Default Copy Strategy",
            description=(
                "Conservative shadow-copy strategy for top simulated trader signals. "
                "Company profits remain in company reserves only."
            ),
            broker_account_id=default_broker.id,
            min_signal_score=Decimal("80.00"),
            max_allocated_capital=Decimal("500000.00"),
            lot_multiplier=Decimal("0.50"),
            max_daily_loss_limit=Decimal("25000.00"),
            stop_loss_required=True,
            allowed_symbols=["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "US30", "NAS100"],
            status=AllocationStatus.ACTIVE,
        )
        db.add(default_strategy)
    await db.commit()

