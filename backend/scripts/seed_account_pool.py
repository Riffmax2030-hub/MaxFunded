"""
Seed script for MT5 Account Pool (Option C).

Pre-populates the database with real/demo MT5 accounts from a broker (like RoboForex, IC Markets, Exness, etc.)
so that whenever a trader buys a challenge, the platform immediately assigns a genuine
demo account from the inventory.

Usage:
    .venv\Scripts\python scripts/seed_account_pool.py
"""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.db.init_db import init_db
from app.models.trading import MT5AccountPool


STARTER_ACCOUNTS = [
    # --- $10,000 Tier ---
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 10000.0,
        "mt5_login": "6011001",
        "mt5_password": "Mxf_10k_pass1!",
        "mt5_investor_password": "Inv_10k_demo1",
        "notes": "Starter seed account for $10k evaluation",
    },
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 10000.0,
        "mt5_login": "6011002",
        "mt5_password": "Mxf_10k_pass2!",
        "mt5_investor_password": "Inv_10k_demo2",
        "notes": "Starter seed account for $10k evaluation",
    },
    # --- $25,000 Tier ---
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 25000.0,
        "mt5_login": "6025001",
        "mt5_password": "Mxf_25k_pass1!",
        "mt5_investor_password": "Inv_25k_demo1",
        "notes": "Starter seed account for $25k evaluation",
    },
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 25000.0,
        "mt5_login": "6025002",
        "mt5_password": "Mxf_25k_pass2!",
        "mt5_investor_password": "Inv_25k_demo2",
        "notes": "Starter seed account for $25k evaluation",
    },
    # --- $50,000 Tier ---
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 50000.0,
        "mt5_login": "6050001",
        "mt5_password": "Mxf_50k_pass1!",
        "mt5_investor_password": "Inv_50k_demo1",
        "notes": "Starter seed account for $50k evaluation",
    },
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 50000.0,
        "mt5_login": "6050002",
        "mt5_password": "Mxf_50k_pass2!",
        "mt5_investor_password": "Inv_50k_demo2",
        "notes": "Starter seed account for $50k evaluation",
    },
    # --- $100,000 Tier ---
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 100000.0,
        "mt5_login": "6100001",
        "mt5_password": "Mxf_100k_pass1!",
        "mt5_investor_password": "Inv_100k_demo1",
        "notes": "Starter seed account for $100k evaluation",
    },
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 100000.0,
        "mt5_login": "6100002",
        "mt5_password": "Mxf_100k_pass2!",
        "mt5_investor_password": "Inv_100k_demo2",
        "notes": "Starter seed account for $100k evaluation",
    },
    # --- $200,000 Tier ---
    {
        "broker_name": "RoboForex",
        "server_name": "RoboForex-Demo",
        "account_tier": 200000.0,
        "mt5_login": "6200001",
        "mt5_password": "Mxf_200k_pass1!",
        "mt5_investor_password": "Inv_200k_demo1",
        "notes": "Starter seed account for $200k evaluation",
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        # Ensure DB tables exist
        await init_db(session)

        seeded_count = 0
        skipped_count = 0

        for item in STARTER_ACCOUNTS:
            stmt = select(MT5AccountPool).where(MT5AccountPool.mt5_login == item["mt5_login"])
            existing = (await session.execute(stmt)).scalar_one_or_none()

            if existing:
                skipped_count += 1
                continue

            acc = MT5AccountPool(
                broker_name=item["broker_name"],
                server_name=item["server_name"],
                account_tier=item["account_tier"],
                mt5_login=item["mt5_login"],
                mt5_password=item["mt5_password"],
                mt5_investor_password=item["mt5_investor_password"],
                notes=item["notes"],
                status="AVAILABLE",
            )
            session.add(acc)
            seeded_count += 1

        await session.commit()
        print(f"[OK] MT5 Account Pool Seeded: {seeded_count} added, {skipped_count} already existed.")


if __name__ == "__main__":
    asyncio.run(seed())
