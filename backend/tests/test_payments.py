import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_payment_methods_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/payments/methods")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_payment_methods_success(client: AsyncClient, trader_token):
    response = await client.get(
        "/api/v1/payments/methods",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert response.status_code == 200
    methods = response.json()
    assert len(methods) >= 6
    ids = [m["id"] for m in methods]
    assert "stripe" in ids
    assert "paypal" in ids
    assert "nowpayments" in ids
    assert "flutterwave" in ids
    assert "paystack" in ids
    assert "bank_transfer" in ids


@pytest.mark.asyncio
async def test_initiate_card_payment(client: AsyncClient, trader_token):
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    response = await client.post(
        "/api/v1/payments/initiate",
        json={
            "challenge_id": challenge_id,
            "provider": "stripe",
            "currency": "USD",
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "stripe"
    assert data["status"] == "PENDING"
    assert data["payment_id"] is not None
    assert data["purchase_id"] is not None
    assert data["redirect_url"] is not None


@pytest.mark.asyncio
async def test_initiate_crypto_payment(client: AsyncClient, trader_token):
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    response = await client.post(
        "/api/v1/payments/initiate",
        json={
            "challenge_id": challenge_id,
            "provider": "nowpayments",
            "currency": "USD",
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "nowpayments"
    assert data["crypto_address"] is not None
    assert data["crypto_amount"] is not None
    assert data["qr_code_url"] is not None


@pytest.mark.asyncio
async def test_initiate_bank_transfer_payment(client: AsyncClient, trader_token):
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    response = await client.post(
        "/api/v1/payments/initiate",
        json={
            "challenge_id": challenge_id,
            "provider": "bank_transfer",
            "currency": "USD",
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "bank_transfer"
    assert data["status"] == "AWAITING_CONFIRMATION"
    assert data["payment_reference_code"].startswith("RMF-W-")
    assert data["bank_details"] is not None
    assert data["bank_details"]["account_number"] is not None
    assert data["bank_details"]["reference_code"] == data["payment_reference_code"]


@pytest.mark.asyncio
async def test_get_payment_status(client: AsyncClient, trader_token):
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    # Initiate payment first
    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={
            "challenge_id": challenge_id,
            "provider": "bank_transfer",
            "currency": "USD",
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]

    # Check status
    status_res = await client.get(
        f"/api/v1/payments/{payment_id}/status",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["id"] == payment_id
    assert status_res.json()["status"] == "AWAITING_CONFIRMATION"


@pytest.mark.asyncio
async def test_admin_confirm_bank_transfer(
    client: AsyncClient,
    trader_token,
    admin_token,
):
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    # 1. User initiates bank transfer
    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={
            "challenge_id": challenge_id,
            "provider": "bank_transfer",
            "currency": "USD",
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]
    purchase_id = init_res.json()["purchase_id"]

    # 2. Regular user cannot confirm bank transfer (403)
    user_confirm = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Attempting fraud confirmation"},
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert user_confirm.status_code == 403

    # 3. Admin confirms bank transfer
    admin_confirm = await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "SWIFT wire confirmed received by Zenith Bank operations."},
        headers={"Authorization": f"Bearer {admin_token['token']}"},
    )
    assert admin_confirm.status_code == 200
    assert admin_confirm.json()["status"] == "COMPLETED"

    # 4. Check that user's purchase is now ACTIVE with MT5 login assigned
    me_purchases = await client.get(
        "/api/v1/users/me/purchases",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert me_purchases.status_code == 200
    user_purchases = me_purchases.json()
    matching_purchase = next((p for p in user_purchases if p["id"] == purchase_id), None)
    assert matching_purchase is not None
    assert matching_purchase["status"] == "ACTIVE"
    assert matching_purchase["mt5_login"] is not None
