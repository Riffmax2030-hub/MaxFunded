"""
Phase 6: KYC & AML Compliance Tests
===================================
Tests trader identity onboarding, sanctions screening, PEP evaluation,
administrative review workflows, and compliance enforcement guards.
"""
import pytest
from httpx import AsyncClient
from app.models.kyc import KYCStatus, AMLStatus, DocumentType
from app.services.kyc_service import kyc_service


async def get_admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/v1/auth/login", json={
        "email": "admin@riffmaxfunding.com",
        "password": "AdminSecret2026!",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


async def register_and_login(client: AsyncClient, email: str, country: str = "GB") -> str:
    resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Compliance Test Trader",
        "country": country,
        "phone": "+447000000099",
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


# ─────────────────────────────────────────────────────────────
# Test 1: Initial KYC status for new user
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_kyc_status_unsubmitted(client: AsyncClient):
    """A fresh trader should have NOT_REQUIRED / NOT_SUBMITTED with requires_action=True."""
    token = await register_and_login(client, "kyc_fresh@test.com")
    resp = await client.get("/api/v1/kyc/status", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_verified"] is False
    assert data["documents_count"] == 0
    assert data["requires_action"] is True


# ─────────────────────────────────────────────────────────────
# Test 2: Trader submits valid KYC documents
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_trader_can_submit_kyc(client: AsyncClient):
    """Trader submits standard passport & proof of address; status becomes PENDING_REVIEW and AML is CLEAR."""
    token = await register_and_login(client, "kyc_valid@test.com")
    payload = {
        "first_name": "Arthur",
        "last_name": "Dent",
        "date_of_birth": "1988-04-12",
        "nationality": "GB",
        "residence_country": "GB",
        "address_line": "42 Cottington Crescent",
        "city": "London",
        "postal_code": "SW1A 1AA",
        "is_politically_exposed": False,
        "documents": [
            {
                "document_type": "PASSPORT",
                "document_number": "GB987654321",
                "issuing_country": "GB",
                "file_name": "passport_scan.pdf",
                "file_url": "/uploads/kyc/passport_scan.pdf",
                "mime_type": "application/pdf",
                "file_size_bytes": 1048576,
                "is_front": True,
            },
            {
                "document_type": "PROOF_OF_ADDRESS",
                "document_number": "UTIL-2026-99",
                "issuing_country": "GB",
                "file_name": "utility_bill.pdf",
                "file_url": "/uploads/kyc/utility_bill.pdf",
                "mime_type": "application/pdf",
                "file_size_bytes": 524288,
                "is_front": True,
            },
        ],
    }
    resp = await client.post("/api/v1/kyc/submit", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "PENDING_REVIEW"
    assert data["aml_status"] == "CLEAR"
    assert data["pep_check_passed"] is True
    assert data["sanctions_check_passed"] is True
    assert len(data["documents"]) == 2

    # Check that status summary reflects the submission
    status_resp = await client.get("/api/v1/kyc/status", headers={"Authorization": f"Bearer {token}"})
    assert status_resp.status_code == 200
    summary = status_resp.json()
    assert summary["kyc_status"] == "PENDING_REVIEW"
    assert summary["documents_count"] == 2


# ─────────────────────────────────────────────────────────────
# Test 3: Sanctions list matching flags AML as HIGH_RISK
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_kyc_submission_sanctioned_country_flagged(client: AsyncClient):
    """Submitting with nationality or residence in sanctioned jurisdiction flags HIGH_RISK."""
    token = await register_and_login(client, "kyc_sanctioned@test.com", country="NG")
    payload = {
        "first_name": "Test",
        "last_name": "Subject",
        "date_of_birth": "1990-01-01",
        "nationality": "IR",  # Iran - Sanctioned
        "residence_country": "NG",
        "address_line": "123 Main St",
        "city": "Lagos",
        "is_politically_exposed": False,
        "documents": [],
    }
    resp = await client.post("/api/v1/kyc/submit", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["sanctions_check_passed"] is False
    assert data["aml_status"] == "HIGH_RISK"
    assert float(data["aml_risk_score"]) >= 80.0


# ─────────────────────────────────────────────────────────────
# Test 4: Politically Exposed Person (PEP) check flags account
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_kyc_submission_pep_flagged(client: AsyncClient):
    """Trader declaring PEP status fails PEP check and is FLAGGED for heightened due diligence."""
    token = await register_and_login(client, "kyc_pep@test.com")
    payload = {
        "first_name": "Senator",
        "last_name": "Official",
        "date_of_birth": "1975-06-15",
        "nationality": "GB",
        "residence_country": "GB",
        "address_line": "Parliament Square",
        "city": "London",
        "is_politically_exposed": True,
        "documents": [],
    }
    resp = await client.post("/api/v1/kyc/submit", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["pep_check_passed"] is False
    assert data["aml_status"] == "FLAGGED"


# ─────────────────────────────────────────────────────────────
# Test 5: Compliance admin endpoints require admin role
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_verifications_requires_compliance_role(client: AsyncClient):
    """Regular traders cannot access the compliance review queue."""
    trader_token = await register_and_login(client, "kyc_unauth@test.com")
    resp = await client.get("/api/v1/kyc/admin/verifications", headers={"Authorization": f"Bearer {trader_token}"})
    assert resp.status_code == 403


# ─────────────────────────────────────────────────────────────
# Test 6: Compliance admin can approve verification
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_compliance_admin_can_approve_kyc(client: AsyncClient):
    """Admin approves submission -> dossier becomes APPROVED, user.kyc_status becomes APPROVED, user.is_verified=True."""
    trader_token = await register_and_login(client, "kyc_approve_target@test.com")
    submit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Approved",
        "last_name": "Trader",
        "date_of_birth": "1992-03-10",
        "nationality": "DE",
        "residence_country": "DE",
        "address_line": "Alexanderplatz 1",
        "city": "Berlin",
        "is_politically_exposed": False,
        "documents": [
            {
                "document_type": "NATIONAL_ID",
                "file_name": "id_card.png",
                "file_url": "/uploads/kyc/id_card.png",
                "mime_type": "image/png",
            }
        ],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    verification_id = submit_resp.json()["id"]

    admin_token = await get_admin_token(client)
    review_resp = await client.post(
        f"/api/v1/kyc/admin/verifications/{verification_id}/review",
        json={
            "status": "APPROVED",
            "reviewer_notes": "Identity confirmed against German Personalausweis. AML clear.",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review_resp.status_code == 200
    data = review_resp.json()
    assert data["status"] == "APPROVED"
    assert data["reviewer_notes"] == "Identity confirmed against German Personalausweis. AML clear."

    # Verify user profile reflects approval
    user_status = await client.get("/api/v1/kyc/status", headers={"Authorization": f"Bearer {trader_token}"})
    assert user_status.json()["kyc_status"] == "APPROVED"
    assert user_status.json()["is_verified"] is True


# ─────────────────────────────────────────────────────────────
# Test 7: Compliance admin can reject verification with reason
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_compliance_admin_can_reject_kyc(client: AsyncClient):
    """Admin rejects submission -> status becomes REJECTED and rejection_reason is displayed."""
    trader_token = await register_and_login(client, "kyc_reject_target@test.com")
    submit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Blurry",
        "last_name": "Scan",
        "date_of_birth": "1995-10-20",
        "nationality": "FR",
        "residence_country": "FR",
        "address_line": "Rue de Paris",
        "city": "Paris",
        "is_politically_exposed": False,
        "documents": [],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    verification_id = submit_resp.json()["id"]

    admin_token = await get_admin_token(client)
    review_resp = await client.post(
        f"/api/v1/kyc/admin/verifications/{verification_id}/review",
        json={
            "status": "REJECTED",
            "rejection_reason": "Document unreadable and expired.",
            "reviewer_notes": "Fraudulent watermark detected.",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review_resp.status_code == 200
    data = review_resp.json()
    assert data["status"] == "REJECTED"
    assert data["rejection_reason"] == "Document unreadable and expired."

    # Trader receives rejection reason
    user_status = await client.get("/api/v1/kyc/status", headers={"Authorization": f"Bearer {trader_token}"})
    assert user_status.json()["kyc_status"] == "REJECTED"
    assert user_status.json()["rejection_reason"] == "Document unreadable and expired."


# ─────────────────────────────────────────────────────────────
# Test 8: Compliance admin can request retry
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_compliance_admin_can_request_retry(client: AsyncClient):
    """Admin requests retry -> status becomes REQUIRES_RETRY and trader can resubmit."""
    trader_token = await register_and_login(client, "kyc_retry_target@test.com")
    submit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Retry",
        "last_name": "User",
        "date_of_birth": "1994-08-08",
        "nationality": "CA",
        "residence_country": "CA",
        "address_line": "100 Bay St",
        "city": "Toronto",
        "is_politically_exposed": False,
        "documents": [],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    verification_id = submit_resp.json()["id"]

    admin_token = await get_admin_token(client)
    review_resp = await client.post(
        f"/api/v1/kyc/admin/verifications/{verification_id}/review",
        json={
            "status": "REQUIRES_RETRY",
            "rejection_reason": "Proof of address must be dated within 90 days.",
            "reviewer_notes": "Utility bill was from 2024.",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "REQUIRES_RETRY"

    # Resubmission succeeds
    resubmit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Retry",
        "last_name": "User",
        "date_of_birth": "1994-08-08",
        "nationality": "CA",
        "residence_country": "CA",
        "address_line": "100 Bay St",
        "city": "Toronto",
        "is_politically_exposed": False,
        "documents": [
            {
                "document_type": "UTILITY_BILL",
                "file_name": "fresh_bill.pdf",
                "file_url": "/uploads/kyc/fresh_bill.pdf",
                "mime_type": "application/pdf",
            }
        ],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    assert resubmit_resp.status_code == 201
    assert resubmit_resp.json()["status"] == "PENDING_REVIEW"


# ─────────────────────────────────────────────────────────────
# Test 9: KYC enforcement guard blocks unverified user
# ─────────────────────────────────────────────────────────────

def test_kyc_enforcement_guard_logic():
    """enforce_kyc_approved raises 403 when user is not approved, passes when approved."""
    from app.models.user import User
    from fastapi import HTTPException

    unverified_user = User(
        email="unverified@test.com",
        kyc_status="PENDING_REVIEW",
        is_verified=False,
    )
    with pytest.raises(HTTPException) as exc_info:
        kyc_service.enforce_kyc_approved(unverified_user)
    assert exc_info.value.status_code == 403

    verified_user = User(
        email="verified@test.com",
        kyc_status="APPROVED",
        is_verified=True,
    )
    # Should not raise
    kyc_service.enforce_kyc_approved(verified_user)


# ─────────────────────────────────────────────────────────────
# Test 10: Re-screening AML endpoint
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_rescreen_aml_endpoint(client: AsyncClient):
    """Admin can trigger on-demand AML re-screening for any verification dossier."""
    trader_token = await register_and_login(client, "kyc_rescreen@test.com")
    submit_resp = await client.post("/api/v1/kyc/submit", json={
        "first_name": "Normal",
        "last_name": "Trader",
        "date_of_birth": "1991-05-15",
        "nationality": "ES",
        "residence_country": "ES",
        "address_line": "Gran Via 12",
        "city": "Madrid",
        "is_politically_exposed": False,
        "documents": [],
    }, headers={"Authorization": f"Bearer {trader_token}"})
    verification_id = submit_resp.json()["id"]

    admin_token = await get_admin_token(client)
    rescreen_resp = await client.post(
        f"/api/v1/kyc/admin/verifications/{verification_id}/screen-aml",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert rescreen_resp.status_code == 200
    data = rescreen_resp.json()
    assert data["aml_status"] == "CLEAR"
    assert data["sanctions_check_passed"] is True
    assert data["pep_check_passed"] is True
