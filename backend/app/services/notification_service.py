"""
Phase 11: Real-Time Event Notifications & Community Webhooks Service.
Handles in-app alert feeds for traders and outbound webhook dispatches to Discord/Telegram.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select, desc, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType, WebhookConfig

logger = logging.getLogger("riffmax.notifications")


class NotificationService:
    # ──────────────────────────────────────────
    # In-App Notifications
    # ──────────────────────────────────────────

    async def create_notification(
        self,
        db: AsyncSession,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "SYSTEM_ALERT",
        action_url: Optional[str] = None,
    ) -> Notification:
        """Stores a persistent notification for the trader."""
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            is_read=False,
            action_url=action_url,
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        return notif

    async def get_user_feed(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 40,
    ) -> Tuple[int, List[Notification]]:
        """Returns the unread count and latest notifications for a trader."""
        # Unread count
        count_stmt = (
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read == False)
        )
        count_res = await db.execute(count_stmt)
        unread_count = count_res.scalar() or 0

        # Notifications list
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        res = await db.execute(stmt)
        return unread_count, list(res.scalars().all())

    async def mark_as_read(
        self,
        db: AsyncSession,
        notification_id: str,
        user_id: str,
    ) -> Notification:
        """Marks an individual notification as read."""
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        res = await db.execute(stmt)
        notif = res.scalar_one_or_none()
        if not notif:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Notification {notification_id} not found",
            )

        notif.is_read = True
        await db.commit()
        await db.refresh(notif)
        return notif

    async def mark_all_as_read(
        self,
        db: AsyncSession,
        user_id: str,
    ) -> int:
        """Marks all unread notifications for a user as read."""
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount

    # ──────────────────────────────────────────
    # Community Webhooks (Discord / Telegram)
    # ──────────────────────────────────────────

    @staticmethod
    def _format_discord_payload(
        event_type: str,
        title: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Formats a rich Discord embed with thematic hex colors."""
        colors = {
            "PHASE_PASSED": 0x10B981,       # Emerald
            "ACCOUNT_FUNDED": 0x06B6D4,     # Cyan
            "RULE_BREACHED": 0xEF4444,      # Red
            "PAYOUT_PAID": 0xF59E0B,        # Amber / Gold
            "CERTIFICATE_ISSUED": 0x8B5CF6, # Violet
            "CHALLENGE_PURCHASED": 0x3B82F6,# Blue
        }
        color = colors.get(event_type, 0x3B82F6)

        fields = []
        if details:
            for k, v in details.items():
                fields.append({
                    "name": k.replace("_", " ").title(),
                    "value": str(v),
                    "inline": True,
                })

        embed = {
            "title": f"⚡ {title}",
            "description": message,
            "color": color,
            "fields": fields,
            "footer": {
                "text": "Riffmax Funding • Live Platform Stream",
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        return {"username": "Riffmax Prop Bot", "embeds": [embed]}

    @staticmethod
    def _format_telegram_payload(
        event_type: str,
        title: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Formats a markdown message for Telegram channels."""
        text = f"📢 *{title}*\n\n{message}\n"
        if details:
            text += "\n"
            for k, v in details.items():
                text += f"• *{k.replace('_', ' ').title()}*: `{v}`\n"
        text += "\n_Riffmax Funding Verified Event_"
        return text

    async def dispatch_webhook(
        self,
        target_service: str,
        webhook_url: str,
        event_type: str,
        title: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Sends an outbound webhook payload safely without interrupting calling code."""
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                if target_service == "DISCORD":
                    payload = self._format_discord_payload(event_type, title, message, details)
                    resp = await client.post(webhook_url, json=payload)
                    return resp.is_success
                elif target_service == "TELEGRAM":
                    text = self._format_telegram_payload(event_type, title, message, details)
                    resp = await client.post(webhook_url, json={"text": text, "parse_mode": "Markdown"})
                    return resp.is_success
                else:
                    resp = await client.post(
                        webhook_url,
                        json={
                            "event": event_type,
                            "title": title,
                            "message": message,
                            "details": details or {},
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        },
                    )
                    return resp.is_success
        except Exception as e:
            logger.warning(f"Outbound webhook dispatch failed to {webhook_url}: {e}")
            return False

    async def broadcast_event(
        self,
        db: AsyncSession,
        event_type: str,
        title: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> int:
        """Broadcasts an event to all configured and subscribed active webhooks."""
        stmt = select(WebhookConfig).where(WebhookConfig.is_active == True)
        res = await db.execute(stmt)
        configs = res.scalars().all()

        dispatched_count = 0
        for cfg in configs:
            subscribed = [e.strip() for e in cfg.events_subscribed.split(",")]
            if event_type in subscribed or "ALL" in subscribed:
                ok = await self.dispatch_webhook(
                    target_service=cfg.target_service,
                    webhook_url=cfg.webhook_url,
                    event_type=event_type,
                    title=title,
                    message=message,
                    details=details,
                )
                if ok:
                    dispatched_count += 1
        return dispatched_count
