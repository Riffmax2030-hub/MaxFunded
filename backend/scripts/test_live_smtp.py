"""
Live SMTP Email Verification Script

Tests sending an authentic MaxFunded branded credentials email to a real inbox
using the credentials configured in backend/.env.

Usage:
  python scripts/test_live_smtp.py your_personal_email@gmail.com
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.services.email_service import email_service


async def main():
    recipient = sys.argv[1] if len(sys.argv) > 1 else settings.SMTP_USER

    print("=" * 60)
    print(">>> MAXFUNDED SMTP LIVE EMAIL TEST <<<")
    print("=" * 60)
    print(f"SMTP Host:       {settings.SMTP_HOST or '(Not configured - running in mock mode)'}")
    print(f"SMTP Port:       {settings.SMTP_PORT}")
    print(f"SMTP User:       {settings.SMTP_USER or '(Empty)'}")
    print(f"From:            {settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>")
    print(f"Sending test to: {recipient}")
    print("-" * 60)

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[!] Note: SMTP credentials are not yet set in backend/.env.")
        print("    The email will be logged in mock mode. Add your Gmail App Password to send live.")

    ok = await email_service.send_credentials_email(
        to_email=recipient,
        trader_name="Trader",
        challenge_name="$100,000 Evaluation Challenge",
        starting_balance=100000.0,
        mt5_login="8812345",
        mt5_password="Mxf_DemoPassword2026!",
        mt5_investor_password="Inv_ReadOnly2026!",
        mt5_server=settings.MT5_CHALLENGE_SERVER,
    )

    print("-" * 60)
    if ok:
        print(f"SUCCESS: Email processed cleanly! Check the inbox (and spam folder) of: {recipient}")
    else:
        print("FAILED: Email could not be sent. Check your SMTP_USER and SMTP_PASSWORD.")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
