"""
Setup / Verify Admin Credentials Script
"""
import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User


async def setup_admin():
    async with AsyncSessionLocal() as session:
        # Check existing admins
        stmt = select(User).where(User.role.in_(["SUPER_ADMIN", "ADMIN"]))
        res = await session.execute(stmt)
        admins = res.scalars().all()

        default_admin_email = "admin@maxfunded.com"
        default_admin_pass = "Admin2026!"

        if not admins:
            # Check if admin@maxfunded.com exists at all
            stmt2 = select(User).where(User.email == default_admin_email)
            existing = (await session.execute(stmt2)).scalar_one_or_none()

            if existing:
                existing.role = "SUPER_ADMIN"
                existing.is_admin = True
                existing.is_active = True
                existing.hashed_password = get_password_hash(default_admin_pass)
                print(f"[UPDATED] Existing user promoted to SUPER_ADMIN: {default_admin_email}")
            else:
                new_admin = User(
                    email=default_admin_email,
                    hashed_password=get_password_hash(default_admin_pass),
                    full_name="Chief Executive Officer (Admin)",
                    country="GB",
                    phone="+447000000000",
                    is_active=True,
                    is_verified=True,
                    is_admin=True,
                    role="SUPER_ADMIN",
                    kyc_status="APPROVED",
                    accepted_terms=True,
                    accepted_privacy=True,
                    accepted_risk_disclosure=True,
                )
                session.add(new_admin)
                print(f"[CREATED] New SUPER_ADMIN created: {default_admin_email}")

            await session.commit()
            print("\nAdmin credentials:")
            print(f"  Email:    {default_admin_email}")
            print(f"  Password: {default_admin_pass}")
            print("  Role:     SUPER_ADMIN")
        else:
            print(f"Found {len(admins)} existing admin account(s):")
            for a in admins:
                print(f"  - Email: {a.email} | Name: {a.full_name} | Role: {a.role} | Active: {a.is_active}")
                # Ensure at least one has a known password
                if a.email == default_admin_email:
                    a.hashed_password = get_password_hash(default_admin_pass)
                    a.is_active = True
                    a.is_admin = True
                    print(f"    -> Reset password for {default_admin_email} to '{default_admin_pass}'")

            # If default_admin_email not in admins list, ensure it exists with known pass
            if not any(a.email == default_admin_email for a in admins):
                stmt_check = select(User).where(User.email == default_admin_email)
                user_check = (await session.execute(stmt_check)).scalar_one_or_none()
                if user_check:
                    user_check.role = "SUPER_ADMIN"
                    user_check.is_admin = True
                    user_check.is_active = True
                    user_check.hashed_password = get_password_hash(default_admin_pass)
                else:
                    new_adm = User(
                        email=default_admin_email,
                        hashed_password=get_password_hash(default_admin_pass),
                        full_name="MaxFunded Admin",
                        country="GB",
                        is_active=True,
                        is_verified=True,
                        is_admin=True,
                        role="SUPER_ADMIN",
                        kyc_status="APPROVED",
                        accepted_terms=True,
                        accepted_privacy=True,
                        accepted_risk_disclosure=True,
                    )
                    session.add(new_adm)
                print(f"    -> Added/Updated {default_admin_email} as SUPER_ADMIN with password '{default_admin_pass}'")

            await session.commit()
            print("\nActive login credentials for Admin Portal:")
            print(f"  Portal URL: http://localhost:3000/login")
            print(f"  Email:      {default_admin_email}")
            print(f"  Password:   {default_admin_pass}")


if __name__ == "__main__":
    asyncio.run(setup_admin())
