"""
Phase 11: Real-Time Notifications, Community Webhooks & In-App Alerts Model.
Tracks trader alert feeds and administrative Discord/Telegram community webhook dispatchers.
"""
from __future__ import annotations

import enum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class NotificationType(str, enum.Enum):
    CHALLENGE_PURCHASED = "CHALLENGE_PURCHASED"
    PHASE_PASSED = "PHASE_PASSED"
    ACCOUNT_FUNDED = "ACCOUNT_FUNDED"
    RULE_BREACHED = "RULE_BREACHED"
    PAYOUT_REQUESTED = "PAYOUT_REQUESTED"
    PAYOUT_PAID = "PAYOUT_PAID"
    KYC_APPROVED = "KYC_APPROVED"
    KYC_REJECTED = "KYC_REJECTED"
    CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED"
    AFFILIATE_COMMISSION = "AFFILIATE_COMMISSION"
    SYSTEM_ALERT = "SYSTEM_ALERT"


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="SYSTEM_ALERT", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User", backref="notifications")


class WebhookConfig(BaseModel):
    __tablename__ = "webhook_configs"

    name = Column(String(80), nullable=False)
    target_service = Column(String(20), nullable=False)  # DISCORD, TELEGRAM, GENERIC
    webhook_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    secret_token = Column(String(128), nullable=True)

    # Subscribed event filters (comma-separated list of NotificationType strings)
    events_subscribed = Column(
        String(500),
        default="CHALLENGE_PURCHASED,PHASE_PASSED,ACCOUNT_FUNDED,RULE_BREACHED,PAYOUT_PAID,CERTIFICATE_ISSUED",
        nullable=False,
    )
