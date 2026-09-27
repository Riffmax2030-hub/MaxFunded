"""
Seed script to create a realistic Demo Trader account with an active $100k challenge,
equity curve history (14 days), and closed/open trades.
"""
import asyncio
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase
from app.models.trading import DailySnapshot, Trade


async def seed_demo():
    async with AsyncSessionLocal() as db:
        email = "trader@maxfunded.com"
        stmt = select(User).where(User.email == email)
        user = (await db.execute(stmt)).scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash("Trader2026!"),
                full_name="Alex Vance (Demo Trader)",
                country="GB",
                phone="+447911123456",
                is_active=True,
                is_verified=True,
                is_admin=False,
                role="TRADER",
                kyc_status="APPROVED",
                accepted_terms=True,
                accepted_privacy=True,
                accepted_risk_disclosure=True,
            )
            db.add(user)
            await db.flush()
            print("Created demo user:", email)
        else:
            user.hashed_password = get_password_hash("Trader2026!")
            user.is_active = True
            user.is_verified = True
            user.kyc_status = "APPROVED"
            await db.flush()
            print("Updated demo user:", email)

        # Get $100k challenge
        ch_stmt = select(Challenge).where(Challenge.slug == "100k-challenge")
        ch = (await db.execute(ch_stmt)).scalar_one_or_none()
        if not ch:
            ch_stmt2 = select(Challenge).order_by(Challenge.starting_balance.desc())
            ch = (await db.execute(ch_stmt2)).scalars().first()

        if not ch:
            print("No challenge found in database! Run init_db first.")
            return

        # Check or create challenge purchase
        p_stmt = (
            select(ChallengePurchase)
            .where(
                ChallengePurchase.user_id == user.id,
                ChallengePurchase.status == "ACTIVE",
            )
            .order_by(ChallengePurchase.created_at.desc())
        )
        purchase = (await db.execute(p_stmt)).scalars().first()

        start_date = datetime.now(timezone.utc) - timedelta(days=14)

        if not purchase:
            purchase = ChallengePurchase(
                user_id=user.id,
                challenge_id=ch.id,
                status="ACTIVE",
                purchase_price=ch.price,
                currency="USD",
                mt5_login="8891024",
                mt5_server="MaxFunded-LiveSim",
                mt5_password="TraderInvestor2026!",
                current_balance=Decimal("108450.00"),
                current_equity=Decimal("109210.00"),
                high_water_mark=Decimal("109210.00"),
                daily_starting_equity=Decimal("108100.00"),
                trading_days_count=9,
                created_at=start_date,
            )
            db.add(purchase)
            await db.flush()
            print("Created active purchase:", purchase.id)
        else:
            purchase.current_balance = Decimal("108450.00")
            purchase.current_equity = Decimal("109210.00")
            purchase.high_water_mark = Decimal("109210.00")
            purchase.daily_starting_equity = Decimal("108100.00")
            purchase.trading_days_count = 9
            await db.flush()
            print("Updated active purchase:", purchase.id)

        # Seed 14 Daily Snapshots (realistic progression)
        # Delete old snapshots for clean state
        snap_stmt = select(DailySnapshot).where(DailySnapshot.purchase_id == purchase.id)
        existing_snaps = (await db.execute(snap_stmt)).scalars().all()
        for s in existing_snaps:
            await db.delete(s)

        curve_data = [
            (14, 100000, 100000, 0, 0),
            (13, 100450, 100600, 450, 3),
            (12, 101200, 101350, 750, 4),
            (11, 100900, 101100, -300, 2),
            (10, 101850, 102100, 950, 5),
            (9, 102600, 102800, 750, 3),
            (8, 102600, 102600, 0, 0), # Weekend
            (7, 102600, 102600, 0, 0), # Weekend
            (6, 103900, 104250, 1300, 6),
            (5, 105150, 105400, 1250, 4),
            (4, 104800, 104650, -350, 3),
            (3, 106300, 106800, 1500, 5),
            (2, 107600, 107950, 1300, 4),
            (1, 108100, 108350, 500, 2),
            (0, 108450, 109210, 350, 3), # Today
        ]

        today = date.today()
        for days_ago, bal, eq, pnl, trades in curve_data:
            snap_date = today - timedelta(days=days_ago)
            snap = DailySnapshot(
                purchase_id=purchase.id,
                snapshot_date=snap_date,
                starting_balance=Decimal(str(bal - pnl)),
                starting_equity=Decimal(str(eq - pnl)),
                ending_balance=Decimal(str(bal)),
                ending_equity=Decimal(str(eq)),
                high_equity=Decimal(str(eq + 250)),
                low_equity=Decimal(str(bal - 150)),
                trades_count=trades,
                daily_profit=Decimal(str(pnl)),
                is_trading_day=(trades > 0),
            )
            db.add(snap)

        # Seed sample closed and open trades
        trade_stmt = select(Trade).where(Trade.purchase_id == purchase.id)
        existing_trades = (await db.execute(trade_stmt)).scalars().all()
        for t in existing_trades:
            await db.delete(t)

        sample_trades = [
            ("TK-1001", "EURUSD", "BUY", "2.00", "1.08250", "1.08750", "1000.00", "CLOSED"),
            ("TK-1002", "GBPUSD", "SELL", "1.50", "1.26500", "1.26100", "600.00", "CLOSED"),
            ("TK-1003", "XAUUSD", "BUY", "0.50", "2345.20", "2338.20", "-350.00", "CLOSED"),
            ("TK-1004", "US30", "BUY", "1.00", "39200.0", "39450.0", "1250.00", "CLOSED"),
            ("TK-1005", "NAS100", "SELL", "1.00", "18250.0", "18100.0", "1500.00", "CLOSED"),
            ("TK-1006", "USDJPY", "BUY", "2.00", "155.200", "154.900", "-400.00", "CLOSED"),
            ("TK-1007", "EURUSD", "BUY", "2.50", "1.08400", "1.08920", "1300.00", "CLOSED"),
            ("TK-1008", "XAUUSD", "BUY", "0.80", "2350.00", None, "760.00", "OPEN"),
        ]

        now = datetime.now(timezone.utc)
        for i, (ticket, sym, t_type, lots, o_price, c_price, pnl, status) in enumerate(sample_trades):
            tr = Trade(
                purchase_id=purchase.id,
                ticket=f"{ticket}-{purchase.id[:6]}",
                symbol=sym,
                trade_type=t_type,
                lots=Decimal(lots),
                open_price=Decimal(o_price),
                close_price=Decimal(c_price) if c_price else None,
                profit=Decimal(pnl),
                commission=Decimal("5.00"),
                swap=Decimal("0.00"),
                status=status,
                open_time=now - timedelta(days=len(sample_trades) - i),
                close_time=now - timedelta(hours=i * 4) if status == "CLOSED" else None,
            )
            db.add(tr)

        await db.commit()
        print("✅ Demo trader successfully seeded with 14-day history and trades!")


if __name__ == "__main__":
    asyncio.run(seed_demo())
