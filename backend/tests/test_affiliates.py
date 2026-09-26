"""
Phase 10 Tests: Affiliate Partner Network, Promo Coupons & Referral Commissions.
Tests multi-tier commission accrual, anti-self-referral validation,
coupon calculations, tier progression, balance deduction, and finance admin review.
"""
from __future__ import annotations

from decimal import Decimal
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.affiliate import AffiliateTier
from app.services.affiliate_service import AffiliateService


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


async def register_and_login(client: AsyncClient, email: str, name: str = "Affiliate User") -> tuple[str, dict]:
    reg = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": name,
        "country": "GB",
        "phone": "+447000111222",
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
async def test_register_affiliate_profile_success(client: AsyncClient, db_session: AsyncSession):
    """Trader registers as an affiliate with a custom code and default crypto payout."""
    token, _ = await register_and_login(client, "affiliate1@test.com", "Partner One")
    resp = await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "referral_code": "PARTNER10",
            "payout_method": "CRYPTO_USDT",
            "payout_address": "0x1234567890abcdef1234567890abcdef12345678",
        },
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["referral_code"] == "PARTNER10"
    assert Decimal(str(data["commission_rate"])) == Decimal("10.00")
    assert data["tier"] == "STANDARD"
    assert data["payout_method"] == "CRYPTO_USDT"
    assert Decimal(str(data["commission_balance"])) == Decimal("0.00")


@pytest.mark.asyncio
async def test_register_affiliate_duplicate_custom_code_rejected(client: AsyncClient, db_session: AsyncSession):
    """Attempting to claim an already registered referral code returns 400."""
    token1, _ = await register_and_login(client, "first_aff@test.com", "First Aff")
    token2, _ = await register_and_login(client, "second_aff@test.com", "Second Aff")

    # First succeeds
    resp1 = await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {token1}"},
        json={"referral_code": "EXCLUSIVE"},
    )
    assert resp1.status_code == 201

    # Second fails with duplicate
    resp2 = await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {token2}"},
        json={"referral_code": "EXCLUSIVE"},
    )
    assert resp2.status_code == 400
    assert "already claimed" in resp2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_coupon_creation_and_validation(client: AsyncClient, db_session: AsyncSession):
    """Admin creates coupon and public validation calculates exact discount."""
    admin_token = await get_admin_token(client)

    # 1. Admin creates 15% coupon
    create_resp = await client.post(
        "/api/v1/affiliates/admin/coupons",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "code": "SUMMER15",
            "discount_percentage": 15.0,
            "max_uses": 100,
        },
    )
    assert create_resp.status_code == 201, create_resp.text
    assert create_resp.json()["code"] == "SUMMER15"

    # 2. Public validate for a $499 challenge
    val_resp = await client.get("/api/v1/affiliates/coupons/validate?code=SUMMER15&price=499.00")
    assert val_resp.status_code == 200, val_resp.text
    val_data = val_resp.json()
    assert val_data["valid"] is True
    assert Decimal(str(val_data["discount_percentage"])) == Decimal("15.00")
    # 499 * 0.15 = 74.85 discount, final price = 424.15
    assert Decimal(str(val_data["discount_amount"])) == Decimal("74.85")
    assert Decimal(str(val_data["final_price"])) == Decimal("424.15")


@pytest.mark.asyncio
async def test_referral_sale_attribution_and_commission_accrual(client: AsyncClient, db_session: AsyncSession):
    """Referred purchase credits affiliate with standard 10% commission."""
    aff_token, aff_user = await register_and_login(client, "referrer@test.com", "Influencer Trader")
    buyer_token, buyer_user = await register_and_login(client, "buyer@test.com", "New Trader")

    # Enroll affiliate
    reg_resp = await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"referral_code": "PROFITMAX"},
    )
    assert reg_resp.status_code == 201

    # Simulate referred sale via affiliate service
    service = AffiliateService()
    commission = await service.record_referral_sale(
        db=db_session,
        referral_code="PROFITMAX",
        purchase_id="test-purchase-uuid-1",
        purchase_amount=Decimal("500.00"),
        buyer_user_id=buyer_user["id"],
    )
    assert commission is not None
    # 10% of $500 = $50.00
    assert Decimal(str(commission.commission_amount)) == Decimal("50.00")

    # Check affiliate profile balance
    profile_resp = await client.get(
        "/api/v1/affiliates/me",
        headers={"Authorization": f"Bearer {aff_token}"},
    )
    assert profile_resp.status_code == 200
    prof = profile_resp.json()
    assert Decimal(str(prof["commission_balance"])) == Decimal("50.00")
    assert Decimal(str(prof["total_commission_earned"])) == Decimal("50.00")
    assert prof["total_purchases_referred"] == 1


@pytest.mark.asyncio
async def test_anti_self_referral_guard(client: AsyncClient, db_session: AsyncSession):
    """Affiliate cannot earn commission on their own purchases."""
    aff_token, aff_user = await register_and_login(client, "selfref@test.com", "Self Referrer")
    await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"referral_code": "SELF10"},
    )

    service = AffiliateService()
    # Attempt to attribute purchase to the same user
    commission = await service.record_referral_sale(
        db=db_session,
        referral_code="SELF10",
        purchase_id="self-purchase-uuid",
        purchase_amount=Decimal("499.00"),
        buyer_user_id=aff_user["id"],
    )
    assert commission is None


@pytest.mark.asyncio
async def test_affiliate_tier_upgrade_to_pro(client: AsyncClient, db_session: AsyncSession):
    """When sales volume reaches $10,000, affiliate tier upgrades to PRO (15%)."""
    aff_token, aff_user = await register_and_login(client, "big_aff@test.com", "Top Influencer")
    _, buyer_user = await register_and_login(client, "whale_buyer@test.com", "Whale Buyer")

    await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"referral_code": "TOPTIER"},
    )

    service = AffiliateService()
    # Credit $12,000 in referred volume
    await service.record_referral_sale(
        db=db_session,
        referral_code="TOPTIER",
        purchase_id="whale-purchase-uuid",
        purchase_amount=Decimal("12000.00"),
        buyer_user_id=buyer_user["id"],
    )

    profile_resp = await client.get(
        "/api/v1/affiliates/me",
        headers={"Authorization": f"Bearer {aff_token}"},
    )
    data = profile_resp.json()
    assert data["tier"] == "PRO"
    assert Decimal(str(data["commission_rate"])) == Decimal("15.00")


@pytest.mark.asyncio
async def test_affiliate_payout_request_and_admin_review(client: AsyncClient, db_session: AsyncSession):
    """Trader requests $75 payout; balance is deducted; admin approves and marks PAID."""
    aff_token, aff_user = await register_and_login(client, "payout_aff@test.com", "Payout Affiliate")
    _, buyer_user = await register_and_login(client, "buyer_for_payout@test.com", "Buyer")
    admin_token = await get_admin_token(client)

    await client.post(
        "/api/v1/affiliates/register",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"referral_code": "PAYME"},
    )

    # Fund affiliate balance with $100 commission
    service = AffiliateService()
    await service.record_referral_sale(
        db=db_session,
        referral_code="PAYME",
        purchase_id="purchase-1",
        purchase_amount=Decimal("1000.00"),
        buyer_user_id=buyer_user["id"],
    )

    # 1. Payout below minimum ($50) should fail
    low_resp = await client.post(
        "/api/v1/affiliates/payout-request",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"amount": 30.00, "method": "CRYPTO_USDT", "destination": "0xABC..."},
    )
    assert low_resp.status_code == 422 or low_resp.status_code == 400

    # 2. Valid payout request of $75
    payout_resp = await client.post(
        "/api/v1/affiliates/payout-request",
        headers={"Authorization": f"Bearer {aff_token}"},
        json={"amount": 75.00, "method": "CRYPTO_USDT", "destination": "0x1234567890abcdef1234"},
    )
    assert payout_resp.status_code == 201, payout_resp.text
    payout_data = payout_resp.json()
    payout_id = payout_data["id"]
    assert payout_data["status"] == "REQUESTED"

    # Balance should be deducted: $100 - $75 = $25
    me_resp = await client.get("/api/v1/affiliates/me", headers={"Authorization": f"Bearer {aff_token}"})
    assert Decimal(str(me_resp.json()["commission_balance"])) == Decimal("25.00")

    # 3. Admin reviews and marks PAID
    review_resp = await client.post(
        f"/api/v1/affiliates/admin/payouts/{payout_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "PAID", "admin_notes": "USDT TxHash: 0x999aaa"},
    )
    assert review_resp.status_code == 200, review_resp.text
    assert review_resp.json()["status"] == "PAID"

    # Check total commission paid
    me_after = await client.get("/api/v1/affiliates/me", headers={"Authorization": f"Bearer {aff_token}"})
    assert Decimal(str(me_after.json()["total_commission_paid"])) == Decimal("75.00")
