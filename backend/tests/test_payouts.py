"""
Phase 7: Trader Profit Payouts & Multi-Method Withdrawal Rails Tests
===================================================================
Tests profit eligibility calculation, 80/20 profit split logic,
strict KYC enforcement, balance deduction and restoration,
and Finance Admin two-step review & payout execution.
"""
import pytest
from decimal import Decimal
from httpx import AsyncClient
from app.models.payout import PayoutStatus, PayoutMethod


async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str) -> str:
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Payout Test Trader",
        "country": "GB",
        "phone": "+447000000888",
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    })
    assert resp.status_code == 201
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!",
    })
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]


async def get_first_challenge_id(client: AsyncClient) -> str:
    resp = await client.get("/api/v1/challenges")
    assert resp.status_code == 200
    challenges = resp.json()
    assert len(challenges) > 0
    return challenges[0]["id"]


async def create_active_purchase(client: AsyncClient, trader_token: str, challenge_id: str) -> str:
    resp = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer", "currency": "USD"},
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code in (200, 201)
    payment_id = resp.json()["payment_id"]

    admin_token = await get_admin_token(client)
    confirm_resp = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Activated for payout tests"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert confirm_resp.status_code == 200

    # Retrieve purchase id
    purchases_resp = await client.get("/api/v1/users/me/purchases", headers={"Authorization": f"Bearer {trader_token}"})
    purchases = purchases_resp.json()
    active = [p for p in purchases if p.get("status") == "ACTIVE"]
    assert len(active) > 0
    return active[0]["id"]


async def approve_user_kyc(client: AsyncClient, trader_token: str) -> None:
    """Submits and approves KYC for the authenticated trader."""
    submit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Arthur",
        "last_name": "Dent",
        "date_of_birth": "1985-05-20",
        "nationality": "GB",
        "residence_country": "GB",
        "address_line": "42 Galaxy Way",
        "city": "London",
        "is_politically_exposed": False,
        "documents": [
            {
                "document_type": "PASSPORT",
                "file_name": "passport.pdf",
                "file_url": "/uploads/kyc/passport.pdf",
                "mime_type": "application/pdf",
            }
        ],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    assert submit_resp.status_code == 201
    verification_id = submit_resp.json()["id"]

    admin_token = await get_admin_token(client)
    review_resp = await client.post(
        f"/api/v1/kyc/admin/verifications/{verification_id}/review",
        json={"status": "APPROVED", "reviewer_notes": "Identity approved for payouts"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review_resp.status_code == 200


# ─────────────────────────────────────────────────────────────
# Test 1: Ineligible when KYC is not approved
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_check_payout_eligibility_unverified_kyc(client: AsyncClient):
    """An unverified trader should be marked is_eligible=False with KYC reason cited."""
    trader_token = await register_and_login(client, "payout_nokyc@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)

    resp = await client.get(
        f"/api/v1/payouts/eligibility/{purchase_id}",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["kyc_approved"] is False
    assert data["is_eligible"] is False
    assert any("KYC" in r for r in data["ineligibility_reasons"])


# ─────────────────────────────────────────────────────────────
# Test 2: Payout request blocked (403) without approved KYC
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_payout_request_rejected_without_kyc(client: AsyncClient):
    """POST /api/v1/payouts/request must return 403 Forbidden if KYC is not APPROVED."""
    trader_token = await register_and_login(client, "payout_blocked_nokyc@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)

    payload = {
        "purchase_id": purchase_id,
        "amount": 200.0,
        "method": "CRYPTO_USDT_TRC20",
        "payout_details": {"wallet_address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"},
    }
    resp = await client.post(
        "/api/v1/payouts/request",
        json=payload,
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 403
    assert "Identity Verification (KYC) required" in resp.json()["detail"]


# ─────────────────────────────────────────────────────────────
# Test 3: KYC approved but no profit -> is_eligible = False
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_check_payout_eligibility_no_profit(client: AsyncClient):
    """With KYC approved but no profit generated above starting balance, is_eligible=False."""
    trader_token = await register_and_login(client, "payout_noprofit@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    resp = await client.get(
        f"/api/v1/payouts/eligibility/{purchase_id}",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["kyc_approved"] is True
    assert float(data["gross_profit"]) == 0.0
    assert data["is_eligible"] is False


# ─────────────────────────────────────────────────────────────
# Test 4: Successful payout request with 80/20 profit split
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_payout_request_success_with_profit(client: AsyncClient):
    """
    Trader with approved KYC and $1,000 profit requests payout:
    - 80% ($800) allocated to trader
    - 20% ($200) company fee
    - Trading account balance deducted by $1,000
    - Status is REQUESTED
    """
    trader_token = await register_and_login(client, "payout_winner@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    # Simulate profitable trade to generate $1,000 profit
    sim_resp = await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={
            "symbol": "EURUSD",
            "trade_type": "BUY",
            "lots": 1.0,
            "open_price": 1.08000,
            "close_price": 1.09000,
            "profit": 1000.0,
            "is_closed": True,
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert sim_resp.status_code == 200
    baseline_balance = sim_resp.json()["current_balance"]

    # Check eligibility
    elig_resp = await client.get(
        f"/api/v1/payouts/eligibility/{purchase_id}",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert elig_resp.status_code == 200
    elig_data = elig_resp.json()
    assert elig_data["is_eligible"] is True
    assert float(elig_data["gross_profit"]) == 1000.0
    assert float(elig_data["eligible_trader_amount"]) == 800.0

    # Request Payout
    req_resp = await client.post(
        "/api/v1/payouts/request",
        json={
            "purchase_id": purchase_id,
            "amount": 1000.0,
            "method": "CRYPTO_USDT_TRC20",
            "payout_details": {"wallet_address": "TJ9a82hf734hfb8234yhf823"},
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert req_resp.status_code == 201
    payout = req_resp.json()
    assert payout["status"] == "REQUESTED"
    assert float(payout["amount"]) == 1000.0
    assert float(payout["trader_amount"]) == 800.0
    assert float(payout["company_fee_amount"]) == 200.0

    # Verify trading account balance deducted by $1,000
    metrics_resp = await client.get(
        f"/api/v1/trading/accounts/{purchase_id}",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert metrics_resp.status_code == 200
    new_balance = metrics_resp.json()["current_balance"]
    assert float(new_balance) == float(baseline_balance) - 1000.0


# ─────────────────────────────────────────────────────────────
# Test 5: Cannot withdraw more than earned profit
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_payout_request_cannot_exceed_profit(client: AsyncClient):
    """Attempting to withdraw $2,000 when only $500 profit exists returns 400 Bad Request."""
    trader_token = await register_and_login(client, "payout_exceed@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    # Simulate $500 profit
    await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={"symbol": "GBPUSD", "trade_type": "BUY", "lots": 0.5, "open_price": 1.25, "profit": 500.0, "is_closed": True},
        headers={"Authorization": f"Bearer {trader_token}"},
    )

    req_resp = await client.post(
        "/api/v1/payouts/request",
        json={
            "purchase_id": purchase_id,
            "amount": 2000.0,
            "method": "PAYPAL",
            "payout_details": {"paypal_email": "trader@example.com"},
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert req_resp.status_code == 400
    assert "exceeds eligible profit" in req_resp.json()["detail"]


# ─────────────────────────────────────────────────────────────
# Test 6: Non-admin blocked from admin payout queue
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_payout_queue_requires_finance_role(client: AsyncClient):
    """Traders cannot view or modify the global finance payout queue."""
    trader_token = await register_and_login(client, "payout_queue_trader@test.com")
    resp = await client.get("/api/v1/payouts/admin/queue", headers={"Authorization": f"Bearer {trader_token}"})
    assert resp.status_code == 403


# ─────────────────────────────────────────────────────────────
# Test 7: Finance Admin marks payout as PAID
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_finance_admin_can_progress_and_pay_payout(client: AsyncClient):
    """Finance admin reviews payout and marks it PAID with blockchain transaction hash."""
    trader_token = await register_and_login(client, "payout_admin_flow@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={"symbol": "XAUUSD", "trade_type": "BUY", "lots": 0.5, "open_price": 2000.0, "profit": 600.0, "is_closed": True},
        headers={"Authorization": f"Bearer {trader_token}"},
    )

    payout_resp = await client.post(
        "/api/v1/payouts/request",
        json={
            "purchase_id": purchase_id,
            "amount": 600.0,
            "method": "CRYPTO_USDT_ERC20",
            "payout_details": {"wallet_address": "0x71C..."},
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert payout_resp.status_code == 201
    payout_id = payout_resp.json()["id"]

    admin_token = await get_admin_token(client)

    # 1. Under review
    review1 = await client.post(
        f"/api/v1/payouts/admin/{payout_id}/review",
        json={"status": "UNDER_REVIEW", "admin_notes": "Checking trade logs for copy trading compliance"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review1.status_code == 200
    assert review1.json()["status"] == "UNDER_REVIEW"

    # 2. Paid
    review2 = await client.post(
        f"/api/v1/payouts/admin/{payout_id}/review",
        json={
            "status": "PAID",
            "tx_hash_or_reference": "0x39a8f4c1b982ef78423bb09a28c41d7e",
            "admin_notes": "USDT dispatched via Binance Institutional",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review2.status_code == 200
    assert review2.json()["status"] == "PAID"
    assert review2.json()["tx_hash_or_reference"] == "0x39a8f4c1b982ef78423bb09a28c41d7e"
    assert review2.json()["processed_at"] is not None


# ─────────────────────────────────────────────────────────────
# Test 8: Trader can cancel unreviewed payout & balance is restored
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_trader_can_cancel_payout_restores_balance(client: AsyncClient):
    """Cancelling a REQUESTED payout restores deducted funds to trading balance."""
    trader_token = await register_and_login(client, "payout_cancel@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={"symbol": "EURUSD", "trade_type": "BUY", "lots": 0.5, "open_price": 1.08, "profit": 400.0, "is_closed": True},
        headers={"Authorization": f"Bearer {trader_token}"},
    )

    # Initial balance with profit
    m1 = await client.get(f"/api/v1/trading/accounts/{purchase_id}", headers={"Authorization": f"Bearer {trader_token}"})
    profit_balance = m1.json()["current_balance"]

    # Request payout of $400
    payout_resp = await client.post(
        "/api/v1/payouts/request",
        json={
            "purchase_id": purchase_id,
            "amount": 400.0,
            "method": "LOCAL_BANK_NGN",
            "payout_details": {"account_number": "0123456789", "bank_name": "Zenith Bank"},
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert payout_resp.status_code == 201
    payout_id = payout_resp.json()["id"]

    # Trader cancels payout
    cancel_resp = await client.post(
        f"/api/v1/payouts/{payout_id}/cancel",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "CANCELLED"

    # Verify balance was restored to original
    m2 = await client.get(f"/api/v1/trading/accounts/{purchase_id}", headers={"Authorization": f"Bearer {trader_token}"})
    restored_balance = m2.json()["current_balance"]
    assert float(restored_balance) == float(profit_balance)


# ─────────────────────────────────────────────────────────────
# Test 9: Admin rejection restores balance to trading account
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_finance_admin_rejection_restores_balance(client: AsyncClient):
    """Admin rejecting payout restores funds to trading account and logs reason."""
    trader_token = await register_and_login(client, "payout_reject@test.com")
    challenge_id = await get_first_challenge_id(client)
    purchase_id = await create_active_purchase(client, trader_token, challenge_id)
    await approve_user_kyc(client, trader_token)

    await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={"symbol": "EURUSD", "trade_type": "BUY", "lots": 0.5, "open_price": 1.08, "profit": 500.0, "is_closed": True},
        headers={"Authorization": f"Bearer {trader_token}"},
    )

    m1 = await client.get(f"/api/v1/trading/accounts/{purchase_id}", headers={"Authorization": f"Bearer {trader_token}"})
    profit_balance = m1.json()["current_balance"]

    payout_resp = await client.post(
        "/api/v1/payouts/request",
        json={
            "purchase_id": purchase_id,
            "amount": 500.0,
            "method": "BANK_WIRE_SWIFT",
            "payout_details": {"iban": "GB82WEST12345678", "swift": "WESTGB2L"},
        },
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert payout_resp.status_code == 201
    payout_id = payout_resp.json()["id"]

    admin_token = await get_admin_token(client)
    reject_resp = await client.post(
        f"/api/v1/payouts/admin/{payout_id}/review",
        json={
            "status": "REJECTED",
            "rejection_reason": "High frequency latency exploitation detected during news embargo",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "REJECTED"
    assert "High frequency" in reject_resp.json()["rejection_reason"]

    # Balance restored
    m2 = await client.get(f"/api/v1/trading/accounts/{purchase_id}", headers={"Authorization": f"Bearer {trader_token}"})
    restored_balance = m2.json()["current_balance"]
    assert float(restored_balance) == float(profit_balance)
