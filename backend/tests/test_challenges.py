import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_active_challenges(client: AsyncClient):
    response = await client.get("/api/v1/challenges")
    assert response.status_code == 200
    challenges = response.json()
    assert len(challenges) >= 5
    # Check that $100,000 challenge exists with correct rules
    flagship = next((c for c in challenges if c["slug"] == "100k-challenge"), None)
    assert flagship is not None
    assert float(flagship["starting_balance"]) == 100000.0
    assert float(flagship["price"]) == 499.0
    assert flagship["rules"]["min_trading_days"] == 5
    assert float(flagship["rules"]["profit_target_percentage"]) == 10.0


@pytest.mark.asyncio
async def test_purchase_challenge_creates_pending_record(client: AsyncClient, trader_token):
    # Fetch available challenges
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]

    headers = {"Authorization": f"Bearer {trader_token['token']}"}
    payload = {"challenge_id": challenge_id}

    response = await client.post("/api/v1/challenges/purchase", json=payload, headers=headers)
    assert response.status_code == 201
    purchase = response.json()
    assert purchase["status"] == "PENDING_PAYMENT"
    assert purchase["user_id"] == trader_token["user"].id
    assert float(purchase["purchase_price"]) > 0

    # Verify user purchases endpoint returns the newly created purchase
    res_me = await client.get("/api/v1/users/me/purchases", headers=headers)
    assert res_me.status_code == 200
    purchases = res_me.json()
    assert len(purchases) == 1
    assert purchases[0]["id"] == purchase["id"]
