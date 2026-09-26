"""
Phase 11: Notification & Webhooks API Router.
"""
from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user, require_roles, RoleName
from app.models.notification import WebhookConfig
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    NotificationFeedResponse,
    WebhookConfigCreate,
    WebhookConfigResponse,
    WebhookTestDispatch,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])
notif_service = NotificationService()


# ──────────────────────────────────────────
# Trader In-App Alert Feed
# ──────────────────────────────────────────

@router.get("/me", response_model=NotificationFeedResponse)
async def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve trader's live alert feed with unread counter."""
    unread_count, notifications = await notif_service.get_user_feed(db, current_user.id)
    return NotificationFeedResponse(
        unread_count=unread_count,
        notifications=notifications,
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an individual notification as read."""
    return await notif_service.mark_as_read(db, notification_id, current_user.id)


@router.post("/read-all", response_model=dict)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications as read."""
    count = await notif_service.mark_all_as_read(db, current_user.id)
    return {"marked_read": count}


# ──────────────────────────────────────────
# Admin Webhook Management
# ──────────────────────────────────────────

@router.get(
    "/admin/webhooks",
    response_model=List[WebhookConfigResponse],
    summary="Admin list community webhook configurations",
)
async def admin_list_webhooks(
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """List all registered community Discord/Telegram webhook dispatchers."""
    stmt = select(WebhookConfig).order_by(desc(WebhookConfig.created_at))
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post(
    "/admin/webhooks",
    response_model=WebhookConfigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin register community webhook endpoint",
)
async def admin_create_webhook(
    payload: WebhookConfigCreate,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Register a new Discord/Telegram webhook URL to receive live prop firm events."""
    cfg = WebhookConfig(
        name=payload.name,
        target_service=payload.target_service,
        webhook_url=payload.webhook_url,
        events_subscribed=payload.events_subscribed or "ALL",
        is_active=True,
    )
    db.add(cfg)
    await db.commit()
    await db.refresh(cfg)
    return cfg


@router.post(
    "/admin/test-dispatch",
    response_model=dict,
    summary="Admin test dispatch a live webhook",
)
async def admin_test_dispatch_webhook(
    payload: WebhookTestDispatch,
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN])),
):
    """Dispatch an immediate test event to a Discord or Telegram channel."""
    success = await notif_service.dispatch_webhook(
        target_service=payload.target_service,
        webhook_url=payload.webhook_url,
        event_type=payload.event_type,
        title=payload.custom_title or "Test Webhook Alert",
        message=payload.custom_message or "Testing Riffmax Funding Webhook Dispatcher.",
        details={
            "account_size": "$100,000",
            "phase": "Phase 1 Passed",
            "environment": "Production",
        },
    )
    return {"dispatched": success, "target": payload.target_service}
