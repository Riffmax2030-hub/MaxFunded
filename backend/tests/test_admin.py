import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(client: AsyncClient, trader_token):
    # Regular trader should be forbidden
    headers = {"Authorization": f"Bearer {trader_token['token']}"}
    response = await client.get("/api/v1/admin/challenges", headers=headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_create_custom_challenge(client: AsyncClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token['token']}"}
    payload = {
        "name": "$300,000 Institutional Elite Challenge",
        "slug": "300k-elite-challenge",
        "starting_balance": "300000.00",
        "price": "1499.00",
        "currency": "USD",
        "description": "High tier institutional challenge",
        "is_active": True,
        "rules": {
            "profit_target_percentage": "10.00",
            "max_daily_loss_percentage": "5.00",
            "max_drawdown_percentage": "10.00",
            "daily_loss_methodology": "STARTING_EQUITY",
            "drawdown_methodology": "STATIC",
            "min_trading_days": 5,
            "max_trading_days": 60,
            "leverage": 100,
            "profit_split_percentage": "85.00",
            "weekend_trading_allowed": True,
            "news_trading_allowed": True,
            "ea_trading_allowed": True,
            "copy_trading_allowed": False,
            "stop_loss_required": False
        }
    }
    response = await client.post("/api/v1/admin/challenges", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["slug"] == "300k-elite-challenge"
    assert float(data["starting_balance"]) == 300000.0
    assert float(data["rules"]["profit_split_percentage"]) == 85.0


@pytest.mark.asyncio
async def test_admin_can_update_purchase_status(client: AsyncClient, admin_token, trader_token):
    # Create a pending purchase first
    res_list = await client.get("/api/v1/challenges")
    ch_id = res_list.json()[0]["id"]

    trader_headers = {"Authorization": f"Bearer {trader_token['token']}"}
    p_res = await client.post("/api/v1/challenges/purchase", json={"challenge_id": ch_id}, headers=trader_headers)
    purchase_id = p_res.json()["id"]

    # Admin activates account
    admin_headers = {"Authorization": f"Bearer {admin_token['token']}"}
    update_res = await client.post(
        f"/api/v1/admin/purchases/{purchase_id}/status?new_status=ACTIVE",
        headers=admin_headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["new_status"] == "ACTIVE"

    # Verify status changed and MT5 mock credentials provisioned
    user_purchases = await client.get("/api/v1/users/me/purchases", headers=trader_headers)
    active_p = next(p for p in user_purchases.json() if p["id"] == purchase_id)
    assert active_p["status"] == "ACTIVE"
    assert active_p["mt5_login"] is not None
    assert active_p["mt5_server"] == "RiffMax-Simulated-MT5"
