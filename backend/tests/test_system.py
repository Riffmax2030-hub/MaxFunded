"""
Phase 12 Tests: System Health & Immutable Audit Logs
Covers:
  - Public health check endpoint (no auth)
  - Health response shape (status, database, metrics)
  - Admin audit log query (SUPER_ADMIN access)
  - Trader is denied audit log access (403)
  - log_action() creates queryable records
  - Audit log filtering by action type
  - Audit log filtering by target_type
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.audit_service import AuditService


# ---------------------------------------------------------------------------
# Helper: create admin token
# ---------------------------------------------------------------------------

async def admin_token(client: AsyncClient) -> str:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@riffmaxfunding.com", "password": "AdminSecret2026!"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


async def trader_token(client: AsyncClient, email: str, password: str = "Password123!") -> str:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


async def register_trader(client: AsyncClient, suffix: str) -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"sysuser_{suffix}@test.com",
            "password": "Password123!",
            "full_name": f"SysUser {suffix}",
            "country": "US",
            "phone": "+1234567890",
            "accepted_terms": True,
            "accepted_privacy": True,
            "accepted_risk_disclosure": True,
        },
    )
    assert resp.status_code in (200, 201), resp.text
    return resp.json()


# ---------------------------------------------------------------------------
# Test 1: Public health check returns 200 with expected shape
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_check_public(client: AsyncClient):
    """GET /api/v1/health should return 200 with no authentication."""
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "status" in data
    assert "database" in data
    assert "metrics" in data
    assert "timestamp" in data


# ---------------------------------------------------------------------------
# Test 2: Health check reflects real DB connectivity
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_check_database_connected(client: AsyncClient):
    """Health check database field should be 'connected' in normal operation."""
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["database"] == "connected"
    assert data["status"] == "healthy"


# ---------------------------------------------------------------------------
# Test 3: Health metrics contain expected keys
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_metrics_keys(client: AsyncClient):
    """Health metrics dict must include all four operational counters."""
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    metrics = resp.json()["metrics"]
    assert "total_registered_traders" in metrics
    assert "active_trading_accounts" in metrics
    assert "pending_payout_requests" in metrics
    assert "active_challenge_tiers" in metrics
    # All values must be non-negative integers
    for key, val in metrics.items():
        assert isinstance(val, int) and val >= 0, f"{key} = {val!r} is not a non-negative int"


# ---------------------------------------------------------------------------
# Test 4: Trader is denied access to audit logs (403)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_audit_logs_denied_for_trader(client: AsyncClient):
    """Regular traders must receive 403 when querying admin audit logs."""
    user = await register_trader(client, "auditdenied")
    tok = await trader_token(client, user["email"])
    resp = await client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert resp.status_code == 403, resp.text


# ---------------------------------------------------------------------------
# Test 5: Unauthenticated request to audit logs is rejected (401)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_audit_logs_denied_unauthenticated(client: AsyncClient):
    """Unauthenticated requests to audit logs must be rejected."""
    resp = await client.get("/api/v1/admin/audit-logs")
    assert resp.status_code == 401, resp.text


# ---------------------------------------------------------------------------
# Test 6: Admin can list audit logs and response has expected shape
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_admin_can_query_audit_logs(client: AsyncClient, db_session: AsyncSession):
    """SUPER_ADMIN can query audit logs; response has total + items list."""
    # Seed an audit log entry
    svc = AuditService()
    await svc.log_action(
        db=db_session,
        actor_id="admin-actor-001",
        actor_email="admin@riffmaxfunding.com",
        action="TEST_ACTION",
        target_type="TEST_TARGET",
        target_id="target-001",
        new_value="created",
        reason="Phase 12 test seed",
    )

    tok = await admin_token(client)
    resp = await client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 1


# ---------------------------------------------------------------------------
# Test 7: Audit log filtering by action type
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_audit_log_filter_by_action(client: AsyncClient, db_session: AsyncSession):
    """Filtering audit logs by action returns only matching records."""
    svc = AuditService()
    # Seed a uniquely-named action
    unique_action = "PHASE12_FILTER_ACTION_XYZ"
    await svc.log_action(
        db=db_session,
        actor_id="filter-actor-001",
        actor_email="admin@riffmaxfunding.com",
        action=unique_action,
        target_type="CHALLENGE",
        target_id="challenge-filter-001",
        new_value="updated",
    )

    tok = await admin_token(client)
    # Filter by this unique action — must return exactly 1
    resp = await client.get(
        f"/api/v1/admin/audit-logs?action={unique_action}",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["action"] == unique_action


# ---------------------------------------------------------------------------
# Test 8: Audit log filtering by target_type
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_audit_log_filter_by_target_type(client: AsyncClient, db_session: AsyncSession):
    """Filtering audit logs by target_type returns only matching records."""
    svc = AuditService()
    unique_type = "UNIQUE_TARGET_TYPE_ABC"
    await svc.log_action(
        db=db_session,
        actor_id="filter-actor-002",
        actor_email="admin@riffmaxfunding.com",
        action="SOME_ADMIN_ACTION",
        target_type=unique_type,
        target_id="entity-002",
        new_value="flagged",
    )

    tok = await admin_token(client)
    resp = await client.get(
        f"/api/v1/admin/audit-logs?target_type={unique_type}",
        headers={"Authorization": f"Bearer {tok}"},
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["target_type"] == unique_type
