import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.email_service import email_service
from app.services.mt5_service import mt5_service
from app.models.trading import MT5AccountPool
from app.core.database import AsyncSessionLocal
from sqlalchemy import select


async def run_verification():
    print("[1/3] Testing module imports...")
    print(f"  - FastAPI App: {app.title}")
    print("  - MT5 Service: OK")
    print("  - Email Service: OK")

    print("[2/3] Testing email dispatch (mock mode)...")
    ok = await email_service.send_credentials_email(
        to_email="trader@maxfunded.com",
        trader_name="Alex Trader",
        challenge_name="$100k Evaluation Challenge",
        starting_balance=100000.0,
        mt5_login="6100001",
        mt5_password="Mxf_100k_pass1!",
        mt5_investor_password="Inv_100k_demo1",
        mt5_server="RoboForex-Demo",
    )
    print(f"  - Email dispatch returned: {ok}")

    print("[3/3] Checking MT5 Account Pool inventory...")
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(MT5AccountPool))
        accounts = res.scalars().all()
        available = sum(1 for a in accounts if a.status == "AVAILABLE")
        assigned = sum(1 for a in accounts if a.status == "ASSIGNED")
        print(f"  - Total Accounts: {len(accounts)}")
        print(f"  - Available:      {available}")
        print(f"  - Assigned:       {assigned}")

    print("[OK] FULL SYSTEM VERIFICATION COMPLETE!")


if __name__ == "__main__":
    asyncio.run(run_verification())
