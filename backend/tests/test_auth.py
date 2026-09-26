import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_success(client: AsyncClient):
    payload = {
        "email": "newtrader@example.com",
        "password": "SecurePassword123!",
        "full_name": "Alexander Hayes",
        "country": "GB",
        "phone": "+447911123456",
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newtrader@example.com"
    assert data["country"] == "GB"
    assert data["is_active"] is True
    assert data["is_admin"] is False
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_registration_blocked_for_restricted_country(client: AsyncClient):
    payload = {
        "email": "blocked@example.com",
        "password": "SecurePassword123!",
        "full_name": "Sanctioned User",
        "country": "KP",  # North Korea - restricted
        "accepted_terms": True,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "regulatory restrictions" in response.json()["detail"]


@pytest.mark.asyncio
async def test_registration_rejected_without_terms(client: AsyncClient):
    payload = {
        "email": "noterms@example.com",
        "password": "SecurePassword123!",
        "full_name": "No Terms",
        "country": "US",
        "accepted_terms": False,
        "accepted_privacy": True,
        "accepted_risk_disclosure": True,
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "must accept the Terms" in response.json()["detail"]


@pytest.mark.asyncio
async def test_user_login_success(client: AsyncClient, trader_token):
    payload = {
        "email": "trader@test.com",
        "password": "TraderPass123!"
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "trader@test.com"


@pytest.mark.asyncio
async def test_user_login_invalid_password(client: AsyncClient, trader_token):
    payload = {
        "email": "trader@test.com",
        "password": "WrongPassword!"
    }
    response = await client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_read_user_me(client: AsyncClient, trader_token):
    headers = {"Authorization": f"Bearer {trader_token['token']}"}
    response = await client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "trader@test.com"
    assert data["full_name"] == "Pro Trader"
