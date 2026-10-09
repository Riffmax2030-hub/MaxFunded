"""
MaxFunded Discord Integration Service.

Dispatches real-time rich embeds to Discord webhooks for:
- Payout proofs (e.g. #payout-proof channel)
- Funded trader announcements (e.g. #hall-of-fame channel)
- Evaluation phase passes (e.g. #milestones channel)
- Operational risk alerts (e.g. #admin-alerts channel)

Uses standard asynchronous HTTP requests via httpx.
Gracefully skips dispatch if DISCORD_WEBHOOK_URL is not set.
"""

import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("maxfunded.discord")


class DiscordService:
    @staticmethod
    async def _send_webhook(webhook_url: Optional[str], payload: Dict[str, Any]) -> bool:
        """Sends a JSON payload to a Discord webhook endpoint asynchronously."""
        url = webhook_url or getattr(settings, "DISCORD_WEBHOOK_URL", "")
        if not url:
            logger.debug("[DISCORD MOCK] Webhook not configured; skipping payload: %s", payload.get("content") or payload.get("embeds", [{}])[0].get("title"))
            return False

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code in (200, 204):
                    logger.info("Successfully dispatched Discord webhook notification.")
                    return True
                else:
                    logger.warning("Discord webhook returned non-200 code: %s %s", res.status_code, res.text)
                    return False
        except Exception as exc:
            logger.warning("Failed to send Discord webhook: %s", exc)
            return False

    async def notify_payout_approved(
        self,
        trader_handle: str,
        amount_usd: float,
        payout_method: str,
        country: str = "GLOBAL",
        tx_reference: Optional[str] = None,
        webhook_url: Optional[str] = None,
    ) -> bool:
        """Announces an approved trader payout in the Discord community proof channel."""
        embed = {
            "title": "💰 REWARD PAYOUT VERIFIED & PROCESSED",
            "description": f"**Trader {trader_handle}** ({country}) just received an institutional reward payout!",
            "color": 0xCCFF00,  # Neon Lime
            "fields": [
                {"name": "Amount", "value": f"**${amount_usd:,.2f} USD**", "inline": True},
                {"name": "Rail / Method", "value": payout_method, "inline": True},
                {"name": "Transaction Hash / Ref", "value": f"`{tx_reference or 'MF-CHAIN-VERIFIED'}`", "inline": False},
            ],
            "footer": {"text": "MaxFunded Payout Engine • Direct USDT & Wire"},
        }
        payload = {
            "username": "MaxFunded Finance Desk",
            "avatar_url": "https://maxfunded.com/logo.png",
            "embeds": [embed],
        }
        return await self._send_webhook(webhook_url, payload)

    async def notify_funded_trader(
        self,
        trader_handle: str,
        account_size_usd: float,
        country: str = "GLOBAL",
        webhook_url: Optional[str] = None,
    ) -> bool:
        """Celebrates a trader who has passed evaluation and received a live funded account."""
        embed = {
            "title": "🏆 NEW FUNDED TRADER ON THE DESK",
            "description": f"Welcome **{trader_handle}** ({country}) to the MaxFunded institutional desk!",
            "color": 0x818CF8,  # Indigo
            "fields": [
                {"name": "Simulated Capital Tier", "value": f"**${account_size_usd:,.0f} USD**", "inline": True},
                {"name": "Profit Split", "value": "**Up to 90%**", "inline": True},
                {"name": "Platform", "value": "MetaTrader 5", "inline": True},
            ],
            "footer": {"text": "MaxFunded Evaluation Engine • Zero Personal Risk"},
        }
        payload = {
            "username": "MaxFunded Desk",
            "avatar_url": "https://maxfunded.com/logo.png",
            "embeds": [embed],
        }
        return await self._send_webhook(webhook_url, payload)

    async def notify_risk_breach(
        self,
        mt5_login: str,
        rule_name: str,
        breached_val: float,
        limit_val: float,
        webhook_url: Optional[str] = None,
    ) -> bool:
        """Sends an operational alert to internal risk officers on Discord."""
        embed = {
            "title": "⚠️ RISK ENGINE BREACH DETECTED",
            "description": f"Account **{mt5_login}** has breached platform limits and trading has been paused.",
            "color": 0xEF4444,  # Red
            "fields": [
                {"name": "Rule", "value": rule_name, "inline": True},
                {"name": "Recorded Metric", "value": f"${breached_val:,.2f}", "inline": True},
                {"name": "Max Permitted", "value": f"${limit_val:,.2f}", "inline": True},
            ],
            "footer": {"text": "MaxFunded Server-Side Risk Engine"},
        }
        payload = {
            "username": "MaxFunded Risk Radar",
            "embeds": [embed],
        }
        return await self._send_webhook(webhook_url, payload)


discord_service = DiscordService()
