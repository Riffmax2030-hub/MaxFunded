"""
MT5 Daily Equity Reset Worker.

Runs as a FastAPI lifespan background task.
At midnight (00:00 server time UTC) every day:
  - Sets daily_starting_equity = current_equity for every ACTIVE challenge purchase.
  - This resets the daily drawdown window so the risk engine correctly measures
    losses relative to that day's starting equity.

Usage: Started automatically from app/main.py lifespan context.
"""

import asyncio
import datetime
import logging

from sqlalchemy import select, update

from app.core.database import AsyncSessionLocal
from app.models.challenge import ChallengePurchase, PurchaseStatus

logger = logging.getLogger(__name__)


async def _seconds_until_next_midnight() -> float:
    """Returns the number of seconds until the next UTC midnight."""
    now = datetime.datetime.now(datetime.timezone.utc)
    tomorrow = (now + datetime.timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    delta = (tomorrow - now).total_seconds()
    return max(delta, 1.0)


async def reset_daily_equity_for_all_active() -> int:
    """
    Core reset function — can be called standalone for testing or manually.
    Returns number of rows updated.
    """
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                update(ChallengePurchase)
                .where(ChallengePurchase.status == PurchaseStatus.ACTIVE.value)
                .where(ChallengePurchase.current_equity.isnot(None))
                .values(
                    daily_starting_equity=ChallengePurchase.current_equity
                )
                .execution_options(synchronize_session=False)
            )
            await db.commit()
            count = result.rowcount
            logger.info(
                "[Daily Reset] Reset daily_starting_equity for %d active accounts at %s UTC",
                count,
                datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            )
            return count
        except Exception as exc:
            await db.rollback()
            logger.exception("[Daily Reset] Failed to reset daily equity: %s", exc)
            return 0


async def daily_equity_reset_worker() -> None:
    """
    Infinite loop background worker.
    Sleeps until the next UTC midnight then triggers the equity reset.
    Designed to be launched once in the FastAPI lifespan.
    """
    logger.info("[Daily Reset] Worker started — waiting for next UTC midnight.")
    while True:
        wait_seconds = await _seconds_until_next_midnight()
        logger.debug("[Daily Reset] Sleeping %.0f seconds until next reset.", wait_seconds)
        await asyncio.sleep(wait_seconds)
        await reset_daily_equity_for_all_active()
