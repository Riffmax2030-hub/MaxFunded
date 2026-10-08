"""
Register Sherif Akanmu, activate $100k account, and dispatch MT5 credentials email
"""
import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from decimal import Decimal
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase, PurchaseStatus
from app.models.trading import MT5AccountPool
from app.services.mt5_service import mt5_service
from app.services.email_service import email_service


async def main():
    email = "sherifolaide2030@gmail.com"
    full_name = "Sherif Akanmu"
    user_pass = "Trader2026!"

    async with AsyncSessionLocal() as db:
        # 1. Check or create User
        stmt = select(User).where(User.email == email)
        user = (await db.execute(stmt)).scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash(user_pass),
                full_name=full_name,
                country="NG",
                phone="+2348000000000",
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
            print(f"[1/4] Created user account for {full_name} ({email})")
        else:
            user.full_name = full_name
            user.is_active = True
            user.is_verified = True
            user.kyc_status = "APPROVED"
            user.hashed_password = get_password_hash(user_pass)
            await db.flush()
            print(f"[1/4] Updated user account for {full_name} ({email})")

        # 2. Get $100,000 Challenge
        stmt_ch = select(Challenge).where(Challenge.starting_balance == Decimal("100000"))
        ch = (await db.execute(stmt_ch)).scalars().first()
        if not ch:
            stmt_ch2 = select(Challenge).order_by(Challenge.starting_balance.desc())
            ch = (await db.execute(stmt_ch2)).scalars().first()

        print(f"[2/4] Selected Challenge: {ch.name} (${Decimal(str(ch.starting_balance)):,.0f})")

        # 3. Create Challenge Purchase
        purchase = ChallengePurchase(
            user_id=user.id,
            challenge_id=ch.id,
            purchase_price=ch.price,
            currency="USD",
            current_balance=Decimal("100000"),
            current_equity=Decimal("100000"),
            high_water_mark=Decimal("100000"),
            daily_starting_equity=Decimal("100000"),
            trading_days_count=0,
            status=PurchaseStatus.ACTIVE.value,
        )
        db.add(purchase)
        await db.flush()

        # Provision MT5 account (from pool or generated)
        purchase = await mt5_service.provision_mt5_account(
            db=db,
            purchase=purchase,
            challenge=ch,
            is_funded=False,
        )
        await db.commit()
        await db.refresh(purchase)

        print(f"[3/4] MT5 Account Provisioned:")
        print(f"      Login:    {purchase.mt5_login}")
        print(f"      Password: {purchase.mt5_password}")
        print(f"      Investor: {purchase.mt5_investor_password}")
        print(f"      Server:   {purchase.mt5_server}")
        print(f"      Balance:  ${Decimal(str(purchase.current_balance)):,.0f}")

        # 4. Dispatch Email via SMTP
        print(f"[4/4] Sending credentials email to {email}...")
        email_sent = await email_service.send_credentials_email(
            to_email=email,
            trader_name=full_name,
            challenge_name=ch.name,
            starting_balance=float(ch.starting_balance),
            mt5_login=str(purchase.mt5_login),
            mt5_password=str(purchase.mt5_password),
            mt5_investor_password=str(purchase.mt5_investor_password),
            mt5_server=str(purchase.mt5_server),
        )

        print(f"\nEmail Delivery Result: {'SENT SUCCESSFULLY! [OK]' if email_sent else 'FAILED [Check SMTP]'}")
        print("\n" + "=" * 60)
        print("  ACCOUNT READY FOR SHERIF AKANMU")
        print("=" * 60)
        print(f"  Trader Portal URL : http://localhost:3000/login")
        print(f"  Portal Email      : {email}")
        print(f"  Portal Password   : {user_pass}")
        print("-" * 60)
        print("  MT5 TRADING PLATFORM CREDENTIALS:")
        print(f"  Server            : {purchase.mt5_server}")
        print(f"  Login / Account ID: {purchase.mt5_login}")
        print(f"  Trader Password   : {purchase.mt5_password}")
        print(f"  Investor Password : {purchase.mt5_investor_password}")
        print(f"  Starting Balance  : ${Decimal(str(purchase.current_balance)):,.2f} USD")
        print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
