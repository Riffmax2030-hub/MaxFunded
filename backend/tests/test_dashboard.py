"""
Tests for Phase 8 — Trader Dashboard API.
7 tests: no-account guard, summary fields, rule compliance,
equity curve (empty + with data), performance report, auth enforcement.
Uses the same self-contained login helpers as all other test files.
"""
from __future__ import annotations

import pytest
from decimal import Decimal
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.models.trading import DailySnapshot


# ──────────────────────────────────────────
# Auth helpers (matches pattern from test_payouts.py)
# ──────────────────────────────────────────

async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str) -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Dashboard Trader",
        "country": "GB",
        "phone": "+447000123456",
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    })
    assert reg.status_code == 201, reg.text
    login = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!",
    })
    assert login.status_code == 200, login.text
    return login.json()["access_token"]


async def get_first_challenge_id(client: AsyncClient) -> str:
    resp = await client.get("/api/v1/challenges")
    assert resp.status_code == 200
    challenges = resp.json()
    assert len(challenges) > 0, "No seeded challenges found"
    return challenges[0]["id"]


async def activate_purchase(client: AsyncClient, admin_token: str, trader_token: str) -> dict:
    """Purchase the seeded challenge via payments/initiate, confirm payment, return the active purchase."""
    challenge_id = await get_first_challenge_id(client)

    # Initiate payment (returns payment_id)
    initiate = await client.post(
        "/api/v1/payments/initiate",
        headers={"Authorization": f"Bearer {trader_token}"},
        json={"challenge_id": challenge_id, "provider": "bank_transfer", "currency": "USD"},
    )
    assert initiate.status_code in (200, 201), initiate.text
    payment_id = initiate.json()["payment_id"]

    # Admin confirms
    confirm = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"admin_notes": "Dashboard activation test"},
    )
    assert confirm.status_code in (200, 201), confirm.text

    # Find the active purchase
    purchases = await client.get(
        "/api/v1/users/me/purchases",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert purchases.status_code == 200
    data = purchases.json()
    active = [p for p in data if p["status"] not in ("PENDING_PAYMENT", "PAYMENT_CONFIRMED", "PROVISIONING")]
    assert active, f"No active purchase found. All: {data}"
    return active[0]


# ──────────────────────────────────────────
# Tests
# ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_dashboard_no_active_account(client: AsyncClient, db_session: AsyncSession):
    """Dashboard summary returns 404 when trader has no active purchase."""
    trader_token = await register_and_login(client, "nodashboard@test.com")
    resp = await client.get(
        "/api/v1/dashboard/summary",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 404
    assert "No active challenge" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_dashboard_summary_fields(client: AsyncClient, db_session: AsyncSession):
    """Dashboard summary returns all required metric fields after purchase activation."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "summarytest@test.com")
    await activate_purchase(client, admin_token, trader_token)

    resp = await client.get(
        "/api/v1/dashboard/summary",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    required_fields = [
        "challenge_name", "account_size", "current_balance", "current_equity",
        "total_profit", "total_profit_pct", "daily_drawdown_used_pct",
        "daily_drawdown_limit_pct", "max_drawdown_used_pct", "max_drawdown_limit_pct",
        "profit_target_pct", "profit_target_reached_pct", "profit_target_achieved",
        "total_trades", "win_rate_pct", "account_status", "kyc_status",
        "has_pending_payout", "rule_compliance", "phase",
    ]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"

    assert data["phase"] == "PHASE_1"
    assert isinstance(data["rule_compliance"], list)
    assert len(data["rule_compliance"]) == 4   # daily loss, max DD, profit target, min days


@pytest.mark.asyncio
async def test_dashboard_rule_compliance_structure(client: AsyncClient, db_session: AsyncSession):
    """Rule compliance list has correct rule names and required keys."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "compliance_struct@test.com")
    await activate_purchase(client, admin_token, trader_token)

    resp = await client.get(
        "/api/v1/dashboard/summary",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    rules = resp.json()["rule_compliance"]
    rule_names = [r["rule_name"] for r in rules]

    assert "Daily Loss Limit" in rule_names
    assert "Maximum Drawdown" in rule_names
    assert "Profit Target" in rule_names
    assert "Minimum Trading Days" in rule_names

    for r in rules:
        assert "is_breached" in r
        assert "is_achieved" in r
        assert "percentage_used" in r


@pytest.mark.asyncio
async def test_equity_curve_empty(client: AsyncClient, db_session: AsyncSession):
    """Equity curve returns a list (possibly with initial activation snapshot) and status 200."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "equitycurve_empty@test.com")
    await activate_purchase(client, admin_token, trader_token)

    resp = await client.get(
        "/api/v1/dashboard/equity-curve",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # Each point must have required keys
    for pt in data:
        assert "equity" in pt
        assert "balance" in pt
        assert "recorded_at" in pt


@pytest.mark.asyncio
async def test_equity_curve_with_data(client: AsyncClient, db_session: AsyncSession):
    """Equity curve includes injected snapshots and returns correct final equity."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "equitycurve_data@test.com")
    purchase = await activate_purchase(client, admin_token, trader_token)
    purchase_id = purchase["id"]

    today = date.today()
    snap1 = DailySnapshot(
        purchase_id=purchase_id,
        snapshot_date=today - timedelta(days=2),
        starting_balance=Decimal("10000"),
        starting_equity=Decimal("10000"),
        ending_balance=Decimal("10200"),
        ending_equity=Decimal("10300"),
        high_equity=Decimal("10300"),
        low_equity=Decimal("10000"),
        trades_count=3,
    )
    snap2 = DailySnapshot(
        purchase_id=purchase_id,
        snapshot_date=today - timedelta(days=1),
        starting_balance=Decimal("10200"),
        starting_equity=Decimal("10200"),
        ending_balance=Decimal("10789"),
        ending_equity=Decimal("10789"),
        high_equity=Decimal("10789"),
        low_equity=Decimal("10200"),
        trades_count=2,
    )
    db_session.add_all([snap1, snap2])
    await db_session.commit()

    resp = await client.get(
        "/api/v1/dashboard/equity-curve?days=7",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    points = resp.json()
    # There could be an activation snapshot + our 2 injected ones
    assert len(points) >= 2
    # The snap2 we injected (yesterday) should appear — find it
    found = any(float(p["equity"]) >= 10789 for p in points)
    assert found, f"Expected equity >= 10789 in points: {points}"


@pytest.mark.asyncio
async def test_performance_report_empty(client: AsyncClient, db_session: AsyncSession):
    """Performance report returns valid structure (trading_days >= 0)."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "perf_empty@test.com")
    await activate_purchase(client, admin_token, trader_token)

    resp = await client.get(
        "/api/v1/dashboard/performance",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "trading_days" in data
    assert data["trading_days"] >= 0
    assert isinstance(data["daily_breakdown"], list)


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client: AsyncClient, db_session: AsyncSession):
    """All dashboard endpoints return 401 without a valid token."""
    for endpoint in [
        "/api/v1/dashboard/summary",
        "/api/v1/dashboard/equity-curve",
        "/api/v1/dashboard/performance",
    ]:
        resp = await client.get(endpoint)
        assert resp.status_code == 401, f"{endpoint} should require auth but got {resp.status_code}"
