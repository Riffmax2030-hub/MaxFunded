import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_trading_accounts_empty_initially(client: AsyncClient, trader_token):
    res = await client.get(
        "/api/v1/trading/accounts",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert res.status_code == 200
    assert len(res.json()) == 0


@pytest.mark.asyncio
async def test_provisioning_and_account_metrics(client: AsyncClient, trader_token, admin_token):
    # 1. Purchase and confirm challenge via bank wire to trigger provisioning
    res_list = await client.get("/api/v1/challenges")
    flagship = next(c for c in res_list.json() if c["slug"] == "100k-challenge")
    challenge_id = flagship["id"]

    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer", "currency": "USD"},
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]
    purchase_id = init_res.json()["purchase_id"]

    # Admin confirms wire
    await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Provision test wire"},
        headers={"Authorization": f"Bearer {admin_token['token']}"},
    )

    # 2. Check trading accounts list
    acc_res = await client.get(
        "/api/v1/trading/accounts",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert acc_res.status_code == 200
    accounts = acc_res.json()
    assert len(accounts) == 1
    acc = accounts[0]
    assert acc["purchase_id"] == purchase_id
    assert acc["status"] == "ACTIVE"
    assert acc["starting_balance"] == 100000.0
    assert acc["current_balance"] == 100000.0
    assert acc["current_equity"] == 100000.0
    assert acc["mt5_login"].startswith("88")
    assert acc["mt5_password"] is not None
    assert acc["mt5_investor_password"] is not None
    assert acc["daily_loss_remaining_usd"] == 5000.0  # 5% of 100,000
    assert acc["max_drawdown_remaining_usd"] == 10000.0  # 10% of 100,000
    assert acc["profit_target_amount"] == 110000.0  # 10% gain target


@pytest.mark.asyncio
async def test_simulate_trade_and_metrics_update(client: AsyncClient, trader_token, admin_token):
    # Setup provisioned account
    res_list = await client.get("/api/v1/challenges")
    challenge_id = res_list.json()[0]["id"]
    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer"},
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]
    purchase_id = init_res.json()["purchase_id"]
    await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Test setup"},
        headers={"Authorization": f"Bearer {admin_token['token']}"},
    )

    # Simulate a winning trade of $800
    trade_res = await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={
            "symbol": "EURUSD",
            "trade_type": "BUY",
            "lots": 2.0,
            "open_price": 1.08200,
            "close_price": 1.08600,
            "profit": 800.00,
            "is_closed": True,
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert trade_res.status_code == 200
    metrics = trade_res.json()
    assert metrics["current_balance"] > metrics["starting_balance"]
    assert metrics["current_equity"] > metrics["starting_balance"]
    assert metrics["trading_days_completed"] == 1

    # Check trade history
    trades_res = await client.get(
        f"/api/v1/trading/accounts/{purchase_id}/trades",
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert trades_res.status_code == 200
    trades = trades_res.json()
    assert len(trades) == 1
    assert trades[0]["symbol"] == "EURUSD"
    assert trades[0]["profit"] == 800.00


@pytest.mark.asyncio
async def test_risk_engine_daily_loss_breach(client: AsyncClient, trader_token, admin_token):
    # 1. Setup $100k account
    res_list = await client.get("/api/v1/challenges")
    flagship = next(c for c in res_list.json() if c["slug"] == "100k-challenge")
    challenge_id = flagship["id"]

    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer"},
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]
    purchase_id = init_res.json()["purchase_id"]
    await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Test setup"},
        headers={"Authorization": f"Bearer {admin_token['token']}"},
    )

    # 2. Simulate catastrophic loss exceeding 5% daily limit ($5,200 loss on $100,000 starting equity)
    trade_res = await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={
            "symbol": "XAUUSD",
            "trade_type": "SELL",
            "lots": 5.0,
            "open_price": 2650.00,
            "close_price": 2702.00,
            "profit": -5200.00,
            "is_closed": True,
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert trade_res.status_code == 200
    metrics = trade_res.json()
    assert metrics["status"] == "BREACHED"
    assert "Daily Loss" in metrics["breached_reason"]
    assert metrics["daily_loss_remaining_usd"] == 0.0


@pytest.mark.asyncio
async def test_risk_engine_profit_target_reached(client: AsyncClient, trader_token, admin_token):
    # 1. Setup $10k challenge (10% target = $1,000 profit; 5 min days)
    res_list = await client.get("/api/v1/challenges")
    small_chal = next(c for c in res_list.json() if c["slug"] == "10k-challenge")
    challenge_id = small_chal["id"]

    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={"challenge_id": challenge_id, "provider": "bank_transfer"},
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    payment_id = init_res.json()["payment_id"]
    purchase_id = init_res.json()["purchase_id"]
    await client.post(
        f"/api/v1/payments/admin/{payment_id}/confirm-bank-transfer",
        json={"admin_notes": "Test setup"},
        headers={"Authorization": f"Bearer {admin_token['token']}"},
    )

    # 2. Simulate 5 days of trading to fulfill min trading days
    # Directly set trading_days_count = 5 for test
    from app.core.database import get_db
    from sqlalchemy import update
    # Simulate a trade of +$1,200 (surpasses $1,000 target)
    trade_res = await client.post(
        f"/api/v1/trading/accounts/{purchase_id}/simulate-trade",
        json={
            "symbol": "US30",
            "trade_type": "BUY",
            "lots": 1.0,
            "open_price": 42000.0,
            "close_price": 42120.0,
            "profit": 1200.00,
            "is_closed": True,
        },
        headers={"Authorization": f"Bearer {trader_token['token']}"},
    )
    assert trade_res.status_code == 200
    metrics = trade_res.json()
    assert metrics["current_equity"] >= 11000.0
    assert metrics["profit_target_progress_percent"] == 100.0
