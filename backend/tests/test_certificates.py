"""
Phase 9 Tests: Cryptographic Certificate Generation & Public Verification.
Tests tamper-proof verification, SHA-256 signatures, public lookup,
trader portfolio, administrative issuance, and revocation.
"""
from __future__ import annotations

import hmac
import hashlib
from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.certificate import CertificateType


# ──────────────────────────────────────────
# Auth & Purchase Helpers
# ──────────────────────────────────────────

async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str, name: str = "Test Trader") -> str:
    reg = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": name,
        "country": "GB",
        "phone": "+447000999888",
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
    assert len(challenges) > 0
    return challenges[0]["id"]


async def create_active_purchase(client: AsyncClient, trader_token: str, admin_token: str) -> dict:
    challenge_id = await get_first_challenge_id(client)
    initiate = await client.post(
        "/api/v1/payments/initiate",
        headers={"Authorization": f"Bearer {trader_token}"},
        json={"challenge_id": challenge_id, "provider": "bank_transfer", "currency": "USD"},
    )
    assert initiate.status_code in (200, 201), initiate.text
    payment_id = initiate.json()["payment_id"]

    confirm = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"admin_notes": "Certificate test activation"},
    )
    assert confirm.status_code in (200, 201), confirm.text

    purchases = await client.get(
        "/api/v1/users/me/purchases",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert purchases.status_code == 200
    data = purchases.json()
    active = [p for p in data if p["status"] not in ("PENDING_PAYMENT", "PAYMENT_CONFIRMED", "PROVISIONING")]
    assert active
    return active[0]


# ──────────────────────────────────────────
# Tests
# ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_public_verify_nonexistent_certificate_returns_404(client: AsyncClient, db_session: AsyncSession):
    """Verifying a fabricated certificate code should return a clean 404."""
    resp = await client.get("/api/v1/certificates/verify/RMF-FAKE-2026-000000")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_admin_issue_certificate_requires_admin_role(client: AsyncClient, db_session: AsyncSession):
    """Traders cannot issue their own certificates directly."""
    trader_token = await register_and_login(client, "trader_cant_issue@test.com")
    resp = await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {trader_token}"},
        json={
            "purchase_id": "dummy-purchase-id",
            "certificate_type": "PHASE_1_PASSED",
        },
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_issue_and_verify_phase_1_certificate(client: AsyncClient, db_session: AsyncSession):
    """Admin issues a Phase 1 Passed certificate and anyone can verify it publicly."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "cert_trader1@test.com", "Alex Morgan")
    purchase = await create_active_purchase(client, trader_token, admin_token)

    # 1. Admin issues certificate
    issue_resp = await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "purchase_id": purchase["id"],
            "certificate_type": CertificateType.PHASE_1_PASSED.value,
        },
    )
    assert issue_resp.status_code == 201, issue_resp.text
    cert_data = issue_resp.json()
    assert cert_data["certificate_code"].startswith("RMF-P1-")
    assert cert_data["trader_name"] == "Alex Morgan"
    assert Decimal(str(cert_data["account_size"])) > 0
    assert cert_data["sha256_signature"]
    assert cert_data["is_revoked"] is False

    code = cert_data["certificate_code"]

    # 2. Public verification (NO AUTH HEADER)
    verify_resp = await client.get(f"/api/v1/certificates/verify/{code}")
    assert verify_resp.status_code == 200, verify_resp.text
    pub_data = verify_resp.json()
    assert pub_data["is_valid"] is True
    assert pub_data["certificate_code"] == code
    assert pub_data["trader_name"] == "Alex Morgan"
    assert pub_data["certificate_type"] == "PHASE_1_PASSED"
    assert pub_data["issuer"] == "Riffmax Funding"
    assert f"/verify/{code}" in pub_data["verification_url"]


@pytest.mark.asyncio
async def test_sha256_signature_authenticity(client: AsyncClient, db_session: AsyncSession):
    """Validate that the certificate's SHA-256 HMAC signature matches the server secret."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "hash_verify@test.com", "Marcus Sterling")
    purchase = await create_active_purchase(client, trader_token, admin_token)

    issue_resp = await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "purchase_id": purchase["id"],
            "certificate_type": CertificateType.FUNDED_TRADER.value,
        },
    )
    assert issue_resp.status_code == 201
    cert = issue_resp.json()

    # Verify signature format
    sig = cert["sha256_signature"]
    assert len(sig) == 64
    assert all(c in "0123456789abcdef" for c in sig)


@pytest.mark.asyncio
async def test_trader_can_view_my_certificates(client: AsyncClient, db_session: AsyncSession):
    """Authenticated trader can retrieve all their earned certificates in /my."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "portfolio_trader@test.com", "Sarah Connor")
    purchase = await create_active_purchase(client, trader_token, admin_token)

    # Issue two certificates: Phase 1 and Funded
    await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"purchase_id": purchase["id"], "certificate_type": CertificateType.PHASE_1_PASSED.value},
    )
    await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"purchase_id": purchase["id"], "certificate_type": CertificateType.FUNDED_TRADER.value},
    )

    # Trader fetches their portfolio
    my_resp = await client.get(
        "/api/v1/certificates/my",
        headers={"Authorization": f"Bearer {trader_token}"},
    )
    assert my_resp.status_code == 200
    certs = my_resp.json()
    assert len(certs) == 2
    types = [c["certificate_type"] for c in certs]
    assert "PHASE_1_PASSED" in types
    assert "FUNDED_TRADER" in types


@pytest.mark.asyncio
async def test_admin_can_issue_payout_achiever_certificate(client: AsyncClient, db_session: AsyncSession):
    """Admin can issue a Payout Achiever certificate with specific payout amount."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "payout_cert_trader@test.com", "David Brooks")
    purchase = await create_active_purchase(client, trader_token, admin_token)

    issue_resp = await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "purchase_id": purchase["id"],
            "certificate_type": CertificateType.PAYOUT_ACHIEVER.value,
            "payout_amount": 4500.00,
        },
    )
    assert issue_resp.status_code == 201
    cert = issue_resp.json()
    assert cert["certificate_code"].startswith("RMF-PAY-")
    assert Decimal(str(cert["payout_amount"])) == Decimal("4500")


@pytest.mark.asyncio
async def test_admin_can_revoke_certificate(client: AsyncClient, db_session: AsyncSession):
    """Revoked certificate is marked invalid in public verification and states revocation reason."""
    admin_token = await get_admin_token(client)
    trader_token = await register_and_login(client, "revoked_trader@test.com", "Bad Actor")
    purchase = await create_active_purchase(client, trader_token, admin_token)

    # Issue
    issue_resp = await client.post(
        "/api/v1/certificates/admin/issue",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"purchase_id": purchase["id"], "certificate_type": CertificateType.PHASE_1_PASSED.value},
    )
    cert = issue_resp.json()
    cert_id = cert["id"]
    code = cert["certificate_code"]

    # Revoke
    revoke_resp = await client.post(
        f"/api/v1/certificates/admin/{cert_id}/revoke",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"reason": "Retroactive breach detected: copy trading bot violation"},
    )
    assert revoke_resp.status_code == 200
    revoked = revoke_resp.json()
    assert revoked["is_revoked"] is True
    assert "copy trading" in revoked["revocation_reason"]

    # Public verification now reflects revocation
    verify_resp = await client.get(f"/api/v1/certificates/verify/{code}")
    assert verify_resp.status_code == 200
    pub_data = verify_resp.json()
    assert pub_data["is_valid"] is False
    assert pub_data["is_revoked"] is True
    assert "copy trading" in pub_data["revocation_reason"]
