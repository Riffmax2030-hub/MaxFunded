"""
Phase 11: Pydantic Schemas for In-App Notifications & Community Webhooks.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    action_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationFeedResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationResponse]


class WebhookConfigCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    target_service: str = Field("DISCORD", pattern=r"^(DISCORD|TELEGRAM|GENERIC)$")
    webhook_url: str = Field(..., min_length=10, max_length=500)
    events_subscribed: Optional[str] = "CHALLENGE_PURCHASED,PHASE_PASSED,ACCOUNT_FUNDED,RULE_BREACHED,PAYOUT_PAID,CERTIFICATE_ISSUED"


class WebhookConfigResponse(BaseModel):
    id: str
    name: str
    target_service: str
    webhook_url: str
    is_active: bool
    events_subscribed: str
    created_at: datetime

    model_config = {"from_attributes": True}


class WebhookTestDispatch(BaseModel):
    target_service: str = "DISCORD"
    webhook_url: str
    event_type: str = "PHASE_PASSED"
    custom_title: Optional[str] = "Test Webhook Alert"
    custom_message: Optional[str] = "Trader Arthur Dent has passed Phase 1 on a $100,000 Challenge!"
