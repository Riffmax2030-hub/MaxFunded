"""
Phase 11 Tests: Real-Time Notifications, Community Webhooks & Alerts.
Tests in-app alert feeds, unread tracking, read acknowledgments,
Discord/Telegram payload structures, and admin webhook dispatchers.
"""
from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.notification_service import NotificationService


# ──────────────────────────────────────────
# Auth Helpers
# ──────────────────────────────────────────

async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str, name: str = "Alert User") -> tuple[str, dict]:
    reg = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": name,
        "country": "GB",
        "phone": "+447000333444",
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    })
    assert reg.status_code == 201, reg.text
    user_data = reg.json()
    login = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!",
    })
    assert login.status_code == 200, login.text
    return login.json()["access_token"], user_data


# ──────────────────────────────────────────
# Tests
# ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_trader_feed_empty_initially(client: AsyncClient, db_session: AsyncSession):
    """A newly registered trader has 0 unread alerts and an empty notification list."""
    token, _ = await register_and_login(client, "fresh_alerts@test.com", "Fresh User")
    resp = await client.get(
        "/api/v1/notifications/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["unread_count"] == 0
    assert data["notifications"] == []


@pytest.mark.asyncio
async def test_create_and_fetch_notifications(client: AsyncClient, db_session: AsyncSession):
    """Injecting notifications updates the unread count and returns the chronologically ordered feed."""
    token, user = await register_and_login(client, "notif_user@test.com", "Feed User")
    service = NotificationService()

    # Create 2 notifications
    await service.create_notification(
        db=db_session,
        user_id=user["id"],
        title="Challenge Account Provisioned",
        message="Your MT5 credentials for the $100K challenge are ready.",
        notification_type="CHALLENGE_PURCHASED",
        action_url="/dashboard",
    )
    await service.create_notification(
        db=db_session,
        user_id=user["id"],
        title="Phase 1 Passed!",
        message="Congratulations, you have hit your 10% profit target.",
        notification_type="PHASE_PASSED",
        action_url="/certificates",
    )

    resp = await client.get(
        "/api/v1/notifications/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["unread_count"] == 2
    assert len(data["notifications"]) == 2
    titles = [n["title"] for n in data["notifications"]]
    assert "Phase 1 Passed!" in titles
    assert "Challenge Account Provisioned" in titles


@pytest.mark.asyncio
async def test_mark_single_notification_read(client: AsyncClient, db_session: AsyncSession):
    """Marking an alert read flips its is_read flag and decrements the unread count."""
    token, user = await register_and_login(client, "markread_user@test.com", "Read User")
    service = NotificationService()

    n = await service.create_notification(
        db=db_session,
        user_id=user["id"],
        title="KYC Verified",
        message="Your identity documents have been approved by compliance.",
        notification_type="KYC_APPROVED",
    )

    # Mark as read
    read_resp = await client.post(
        f"/api/v1/notifications/{n.id}/read",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert read_resp.status_code == 200
    assert read_resp.json()["is_read"] is True

    # Check feed unread count is now 0
    feed = await client.get("/api/v1/notifications/me", headers={"Authorization": f"Bearer {token}"})
    assert feed.json()["unread_count"] == 0


@pytest.mark.asyncio
async def test_mark_all_notifications_read(client: AsyncClient, db_session: AsyncSession):
    """Calling /read-all clears all unread notifications in one action."""
    token, user = await register_and_login(client, "bulk_read@test.com", "Bulk User")
    service = NotificationService()

    for i in range(3):
        await service.create_notification(
            db=db_session,
            user_id=user["id"],
            title=f"Notification #{i}",
            message="Test alert message",
        )

    # Verify unread=3
    f1 = await client.get("/api/v1/notifications/me", headers={"Authorization": f"Bearer {token}"})
    assert f1.json()["unread_count"] == 3

    # Mark all read
    bulk_resp = await client.post(
        "/api/v1/notifications/read-all",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert bulk_resp.status_code == 200
    assert bulk_resp.json()["marked_read"] == 3

    # Verify unread=0
    f2 = await client.get("/api/v1/notifications/me", headers={"Authorization": f"Bearer {token}"})
    assert f2.json()["unread_count"] == 0


@pytest.mark.asyncio
async def test_discord_and_telegram_payload_formatters():
    """Verify webhook payload structures for Discord rich embeds and Telegram markdown."""
    service = NotificationService()

    # Discord formatting
    discord_payload = service._format_discord_payload(
        event_type="PHASE_PASSED",
        title="Phase 1 Passed",
        message="Trader John Doe has hit target.",
        details={"Account": "$100,000", "Profit": "$10,240"},
    )
    assert "embeds" in discord_payload
    embed = discord_payload["embeds"][0]
    assert embed["color"] == 0x10B981  # Emerald green for pass
    assert len(embed["fields"]) == 2

    # Telegram formatting
    tg_text = service._format_telegram_payload(
        event_type="PAYOUT_PAID",
        title="Payout Dispatched",
        message="Profit payout of $4,200 has been sent to trader.",
        details={"Method": "USDT TRC20"},
    )
    assert "📢 *Payout Dispatched*" in tg_text
    assert "USDT TRC20" in tg_text


@pytest.mark.asyncio
async def test_admin_webhook_configuration_crud(client: AsyncClient, db_session: AsyncSession):
    """Admin registers and lists Discord/Telegram webhook integrations."""
    admin_token = await get_admin_token(client)

    # Create webhook config
    create_resp = await client.post(
        "/api/v1/notifications/admin/webhooks",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Discord General Announcements",
            "target_service": "DISCORD",
            "webhook_url": "https://discord.com/api/webhooks/123456789/fake-token",
            "events_subscribed": "PHASE_PASSED,ACCOUNT_FUNDED,PAYOUT_PAID",
        },
    )
    assert create_resp.status_code == 201, create_resp.text
    data = create_resp.json()
    assert data["name"] == "Discord General Announcements"
    assert data["target_service"] == "DISCORD"
    assert data["is_active"] is True

    # List webhooks
    list_resp = await client.get(
        "/api/v1/notifications/admin/webhooks",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert list_resp.status_code == 200
    configs = list_resp.json()
    assert len(configs) >= 1
    assert any(c["name"] == "Discord General Announcements" for c in configs)
