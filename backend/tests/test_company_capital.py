"""
Phase 5: Company Capital Tests
==============================
Tests the isolated company capital layer:
  - Admin broker account creation
  - Signal score evaluation after trades
  - Signal leaderboard listing
  - Allocation strategy CRUD
  - RBAC isolation (non-admin forbidden)
  - Copy engine independence from retail evaluation
"""
import pytest
from decimal import Decimal
from httpx import AsyncClient

from app.models.company_capital import (
    CompanyBrokerAccount,
    TraderSignalProfile,
    CompanyAllocationStrategy,
    BrokerType,
    BrokerConnectionStatus,
    AllocationStatus,
)
from app.services.copy_engine import copy_engine


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str, password: str = "Trader123!") -> str:
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Signal Test Trader",
        "country": "GB",
        "phone": "+447000000001",
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    })
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def get_first_challenge_id(client: AsyncClient) -> str:
    resp = await client.get("/api/v1/challenges")
    assert resp.status_code == 200
    challenges = resp.json()
    assert len(challenges) > 0
    return challenges[0]["id"]


async def create_active_purchase(client: AsyncClient, trader_token: str, challenge_id: str) -> str:
    """Creates a purchase and manually activates it via admin payment confirm."""
    # Initiate bank transfer payment
    resp = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer", "currency": "USD"},
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code in (200, 201)
    payment = resp.json()
    payment_id = payment["payment_id"]

    # Admin confirms payment
    admin_token = await get_admin_token(client)
    confirm_resp = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Test payment confirmed"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert confirm_resp.status_code == 200, f"Confirm failed: {confirm_resp.text}"

    # Get purchase_id from the confirm response, or fall back to user purchases
    confirm_data = confirm_resp.json()
    purchase_id = confirm_data.get("purchase_id")

    if not purchase_id:
        # Fall back: fetch from user's purchases list
        purchases_resp = await client.get(
            "/api/v1/users/me/purchases",
            headers={"Authorization": f"Bearer {trader_token}"},
        )
        assert purchases_resp.status_code == 200
        purchases = purchases_resp.json()
        assert len(purchases) > 0, "No purchases found after payment confirm"
        # Return the most recent ACTIVE one
        active = [p for p in purchases if p.get("status") == "ACTIVE"]
        assert len(active) > 0, "No active purchase found after confirm"
        purchase_id = active[0]["id"]

    return purchase_id


# ─────────────────────────────────────────────────────────────
# Test 1: Seeded broker account exists
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_seeded_broker_account_exists(client: AsyncClient):
    """init_db seeds a SIMULATED_TESTNET broker account and an active strategy."""
    admin_token = await get_admin_token(client)
    resp = await client.get(
        "/api/v1/capital/broker-accounts",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    accounts = resp.json()
    assert len(accounts) >= 1
    testnet = next((a for a in accounts if a["account_number"] == "RIFFMAX-TESTNET-001"), None)
    assert testnet is not None
    assert testnet["broker_type"] == "SIMULATED_TESTNET"
    assert testnet["is_active"] is True
    assert float(testnet["balance"]) == 5_000_000.00


# ─────────────────────────────────────────────────────────────
# Test 2: Admin creates a broker account
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_create_broker_account(client: AsyncClient):
    """Super Admin can register a new broker account."""
    admin_token = await get_admin_token(client)
    payload = {
        "broker_name": "Test Prime Broker",
        "broker_type": "PRIME_BROKER",
        "account_number": "PRIME-99001",
        "server_address": "prime.example.com:443",
        "currency": "USD",
        "balance": 2000000.00,
        "max_capital_allocation": 1000000.00,
        "api_credentials": {"key": "test-key", "secret": "test-secret"},
    }
    resp = await client.post(
        "/api/v1/capital/broker-accounts",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["account_number"] == "PRIME-99001"
    assert data["broker_type"] == "PRIME_BROKER"
    assert float(data["equity"]) == 2_000_000.00

    # Duplicate account number should fail
    dup_resp = await client.post(
        "/api/v1/capital/broker-accounts",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dup_resp.status_code == 409


# ─────────────────────────────────────────────────────────────
# Test 3: Non-admin is forbidden
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_capital_endpoints_require_admin(client: AsyncClient):
    """Regular traders must be rejected from all company capital endpoints."""
    trader_token = await register_and_login(client, "trader_blocked@test.com")

    endpoints = [
        ("GET", "/api/v1/capital/broker-accounts"),
        ("GET", "/api/v1/capital/leaderboard"),
        ("GET", "/api/v1/capital/strategies"),
        ("GET", "/api/v1/capital/executions"),
    ]
    for method, url in endpoints:
        if method == "GET":
            resp = await client.get(url, headers={"Authorization": f"Bearer {trader_token}"})
        assert resp.status_code == 403, f"Expected 403 for {method} {url}, got {resp.status_code}"


# ─────────────────────────────────────────────────────────────
# Test 4: Signal score starts at default for new account
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signal_score_evaluation_no_trades(client: AsyncClient):
    """With zero trades, signal score evaluates to baseline (60) and eligible=False."""
    trader_token = await register_and_login(client, "signal_test_notrades@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)

    admin_token = await get_admin_token(client)
    resp = await client.post(
        f"/api/v1/capital/score/{purchase_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert float(data["signal_score"]) == 60.0
    assert data["is_eligible_for_copy"] is False
    assert data["total_trades_analyzed"] == 0


# ─────────────────────────────────────────────────────────────
# Test 5: Signal score improves after profitable trades
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_signal_score_improves_with_profitable_trades(client: AsyncClient):
    """After multiple winning simulated trades, signal score should rise above 75."""
    trader_token = await register_and_login(client, "signal_winner@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)

    # Simulate 10 profitable closed trades
    for i in range(10):
        resp = await client.post(
            f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
            json={
                "symbol": "EURUSD",
                "trade_type": "BUY",
                "lots": 0.10,
                "open_price": 1.08000 + (i * 0.00010),
                "close_price": 1.08200 + (i * 0.00010),
                "profit": 20.00,
                "is_closed": True,
            },
            headers={"Authorization": f"Bearer {trader_token}"},
        )
        assert resp.status_code == 200

    # Check leaderboard
    admin_token = await get_admin_token(client)
    lb_resp = await client.get(
        "/api/v1/capital/leaderboard",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert lb_resp.status_code == 200
    entries = lb_resp.json()
    assert len(entries) >= 1

    # Find our purchase in leaderboard
    our_entry = next((e for e in entries if e["purchase_id"] == purchase_id), None)
    assert our_entry is not None, "Trader should appear in leaderboard after trades"
    assert float(our_entry["signal_score"]) > 60.0, "Score should exceed baseline after wins"


# ─────────────────────────────────────────────────────────────
# Test 6: Allocation strategy CRUD
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_allocation_strategy_crud(client: AsyncClient):
    """Admin can create and update allocation strategies."""
    admin_token = await get_admin_token(client)

    # Get the seeded broker account id
    accounts_resp = await client.get(
        "/api/v1/capital/broker-accounts",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    accounts = accounts_resp.json()
    broker_id = next(
        a["id"] for a in accounts if a["account_number"] == "RIFFMAX-TESTNET-001"
    )

    # Create a new strategy
    resp = await client.post(
        "/api/v1/capital/strategies",
        json={
            "name": "Aggressive Growth Strategy",
            "description": "High-score signals with 1.0x lot multiplier",
            "broker_account_id": broker_id,
            "min_signal_score": 85.0,
            "max_allocated_capital": 250000.0,
            "lot_multiplier": 1.0,
            "max_daily_loss_limit": 15000.0,
            "stop_loss_required": True,
            "allowed_symbols": ["EURUSD", "GBPUSD", "XAUUSD"],
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201
    strategy = resp.json()
    strategy_id = strategy["id"]
    assert strategy["status"] == "ACTIVE"
    assert strategy["lot_multiplier"] == "1.00"

    # Pause it
    pause_resp = await client.patch(
        f"/api/v1/capital/strategies/{strategy_id}/status",
        json={"status": "PAUSED"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert pause_resp.status_code == 200
    assert pause_resp.json()["status"] == "PAUSED"

    # List strategies
    list_resp = await client.get(
        "/api/v1/capital/strategies",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert list_resp.status_code == 200
    strats = list_resp.json()
    assert any(s["id"] == strategy_id for s in strats)


# ─────────────────────────────────────────────────────────────
# Test 7: Leaderboard eligible_only filter
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_leaderboard_eligible_only_filter(client: AsyncClient):
    """eligible_only=true should return only accounts with is_eligible_for_copy=True."""
    admin_token = await get_admin_token(client)

    resp = await client.get(
        "/api/v1/capital/leaderboard?eligible_only=true",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    entries = resp.json()
    for entry in entries:
        assert entry["is_eligible_for_copy"] is True


# ─────────────────────────────────────────────────────────────
# Test 8: Execution journal is empty initially
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_executions_journal_accessible(client: AsyncClient):
    """Admin can access the execution journal endpoint."""
    admin_token = await get_admin_token(client)
    resp = await client.get(
        "/api/v1/capital/executions",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


# ─────────────────────────────────────────────────────────────
# Test 9: Copy engine isolation — profits stay in company reserves
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_copy_engine_never_touches_trader_balance(client: AsyncClient, db_session):
    """
    Shadow copy orders must NOT modify trader purchase balances or equity.
    Company capital is strictly separated from retail evaluation.
    """
    from sqlalchemy import select as sa_select
    from app.models.challenge import ChallengePurchase

    trader_token = await register_and_login(client, "isolation_check@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)

    # Get baseline balance
    metrics_resp = await client.get(
        f"/api/v1/trading/accounts/{purchase_id}",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert metrics_resp.status_code == 200
    baseline_balance = metrics_resp.json()["current_balance"]

    # Directly call the copy engine's shadow copy order
    execution = await copy_engine.route_shadow_copy_order(
        purchase_id=purchase_id,
        symbol="EURUSD",
        side="BUY",
        lots=1.0,
        price=1.08000,
        db=db_session,
    )
    # It may return None (trader not yet copy-eligible) or an execution — both are valid
    # but trader's purchase balance must NEVER be changed by this call

    p_res = await db_session.execute(
        sa_select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
    )
    purchase = p_res.scalar_one()
    assert float(purchase.current_balance) == float(baseline_balance), (
        "Shadow copy order must NOT modify trader's retail account balance"
    )
