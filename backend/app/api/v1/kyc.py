"""
KYC & AML Verification API
==========================
Endpoints for trader identity onboarding, sanctions screening,
compliance dossier management, and administrative verification reviews.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.rbac import get_current_user, RoleName, require_roles
from app.models.user import User
from app.models.kyc import (
    KYCVerification,
    KYCDocument,
    KYCStatus,
    AMLStatus,
)
from app.schemas.kyc import (
    KYCSubmissionRequest,
    KYCVerificationResponse,
    KYCSummaryResponse,
    AdminKYCReviewRequest,
    AMLScreeningResultResponse,
)
from app.services.kyc_service import kyc_service

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# TRADER ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get(
    "/status",
    response_model=KYCSummaryResponse,
    summary="Get current user KYC compliance status",
)
async def get_my_kyc_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns a high-level summary of the trader's identity verification state and reviewer notes."""
    stmt = (
        select(KYCVerification)
        .options(selectinload(KYCVerification.documents))
        .where(KYCVerification.user_id == current_user.id)
        .order_by(desc(KYCVerification.created_at))
    )
    res = await db.execute(stmt)
    dossier = res.scalars().first()

    if not dossier:
        return KYCSummaryResponse(
            user_id=current_user.id,
            kyc_status=current_user.kyc_status,
            aml_status=AMLStatus.PENDING.value,
            is_verified=current_user.is_verified,
            verification_id=None,
            documents_count=0,
            submitted_at=None,
            reviewed_at=None,
            reviewer_notes=None,
            rejection_reason=None,
            requires_action=True,
        )

    requires_action = dossier.status in (KYCStatus.NOT_SUBMITTED, KYCStatus.REJECTED, KYCStatus.REQUIRES_RETRY)

    return KYCSummaryResponse(
        user_id=current_user.id,
        kyc_status=dossier.status.value,
        aml_status=dossier.aml_status.value,
        is_verified=current_user.is_verified,
        verification_id=dossier.id,
        documents_count=len(dossier.documents),
        submitted_at=dossier.submitted_at,
        reviewed_at=dossier.reviewed_at,
        reviewer_notes=dossier.reviewer_notes,
        rejection_reason=dossier.rejection_reason,
        requires_action=requires_action,
    )


@router.get(
    "/dossier",
    response_model=KYCVerificationResponse,
    summary="Get detailed KYC dossier for current user",
)
async def get_my_dossier(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the trader's full verification dossier including uploaded documents."""
    stmt = (
        select(KYCVerification)
        .options(selectinload(KYCVerification.documents))
        .where(KYCVerification.user_id == current_user.id)
        .order_by(desc(KYCVerification.created_at))
    )
    res = await db.execute(stmt)
    dossier = res.scalars().first()

    if not dossier:
        dossier = await kyc_service.get_or_create_dossier(current_user.id, db)

    return dossier


@router.post(
    "/submit",
    response_model=KYCVerificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit KYC identity documents and details",
)
async def submit_kyc(
    payload: KYCSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits identity information and document records for verification.
    Automatically executes real-time AML / PEP / Sanctions screening.
    """
    verification = await kyc_service.submit_verification(
        user=current_user,
        payload=payload,
        db=db,
    )
    return verification


# ─────────────────────────────────────────────────────────────
# COMPLIANCE ADMIN ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get(
    "/admin/verifications",
    response_model=List[KYCVerificationResponse],
    summary="List all KYC verification submissions",
)
async def list_verifications(
    status_filter: Optional[KYCStatus] = Query(None, description="Filter by status (PENDING_REVIEW, APPROVED, etc.)"),
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.COMPLIANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Compliance Admin only: Returns all submitted KYC verification dossiers."""
    stmt = (
        select(KYCVerification)
        .options(selectinload(KYCVerification.documents))
        .order_by(desc(KYCVerification.submitted_at), desc(KYCVerification.created_at))
        .limit(limit)
    )
    if status_filter:
        stmt = stmt.where(KYCVerification.status == status_filter)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get(
    "/admin/verifications/{verification_id}",
    response_model=KYCVerificationResponse,
    summary="Get single verification dossier",
)
async def get_verification_by_id(
    verification_id: str,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.COMPLIANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Compliance Admin only: Retrieves a specific KYC dossier for detailed investigation."""
    stmt = (
        select(KYCVerification)
        .options(selectinload(KYCVerification.documents))
        .where(KYCVerification.id == verification_id)
    )
    res = await db.execute(stmt)
    verification = res.scalar_one_or_none()

    if not verification:
        raise HTTPException(status_code=404, detail="KYC verification not found")

    return verification


@router.post(
    "/admin/verifications/{verification_id}/review",
    response_model=KYCVerificationResponse,
    summary="Approve, reject, or request retry for KYC submission",
)
async def review_verification_dossier(
    verification_id: str,
    payload: AdminKYCReviewRequest,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.COMPLIANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Compliance Admin only: Finalizes verification decision (APPROVED, REJECTED, REQUIRES_RETRY).
    Automatically propagates identity verification status to the trader's account.
    """
    verification = await kyc_service.review_verification(
        verification_id=verification_id,
        reviewer=current_admin,
        payload=payload,
        db=db,
    )
    return verification


@router.post(
    "/admin/verifications/{verification_id}/screen-aml",
    response_model=AMLScreeningResultResponse,
    summary="Re-execute AML, PEP and Sanctions screening",
)
async def rescreen_aml(
    verification_id: str,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.COMPLIANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Compliance Admin only: Re-screens the trader against latest sanctions/PEP rules
    and updates the verification's risk profile.
    """
    stmt = select(KYCVerification).where(KYCVerification.id == verification_id)
    res = await db.execute(stmt)
    verification = res.scalar_one_or_none()

    if not verification:
        raise HTTPException(status_code=404, detail="KYC verification not found")

    aml_status, risk_score, pep_passed, sanctions_passed, flags = kyc_service.screen_aml(
        nationality=verification.nationality,
        residence_country=verification.residence_country,
        is_politically_exposed=verification.is_politically_exposed,
    )

    verification.aml_status = aml_status
    verification.aml_risk_score = risk_score
    verification.pep_check_passed = pep_passed
    verification.sanctions_check_passed = sanctions_passed

    await db.commit()
    await db.refresh(verification)

    return AMLScreeningResultResponse(
        verification_id=verification.id,
        user_id=verification.user_id,
        aml_status=aml_status,
        aml_risk_score=risk_score,
        pep_check_passed=pep_passed,
        sanctions_check_passed=sanctions_passed,
        flags=flags,
    )
