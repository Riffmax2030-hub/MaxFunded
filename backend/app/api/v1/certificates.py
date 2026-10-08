"""
Phase 9: Cryptographic Certificate API Endpoints.
Includes public verification (no auth needed for verifying QR codes / links),
trader certificate portfolio retrieval, and administrator issuance/revocation.
"""
from __future__ import annotations

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.rbac import get_current_user, require_roles, RoleName
from app.models.challenge import ChallengePurchase
from app.models.user import User
from app.schemas.certificate import (
    CertificateResponse,
    CertificatePublicVerifyResponse,
    CertificateIssueRequest,
    CertificateRevokeRequest,
)
from app.services.certificate_service import CertificateService
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/certificates", tags=["Certificates & Verification"])
cert_service = CertificateService()


@router.get(
    "/verify/{code}",
    response_model=CertificatePublicVerifyResponse,
    summary="Public verification endpoint for certificate validation",
)
async def verify_certificate_public(
    code: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Publicly verify a trader's certificate using its unique code.
    No authentication required — accessible to anyone verifying via QR code or shared link.
    """
    cert = await cert_service.get_by_code(db, code)
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate '{code}' was not found in our verifiable registry.",
        )

    frontend_base = getattr(settings, "FRONTEND_URL", "https://maxfunded.com")
    verification_url = f"{frontend_base}/verify/{cert.certificate_code}"

    return CertificatePublicVerifyResponse(
        is_valid=not cert.is_revoked,
        certificate_code=cert.certificate_code,
        certificate_type=cert.certificate_type,
        trader_name=cert.trader_name,
        challenge_name=cert.challenge_name,
        account_size=cert.account_size,
        payout_amount=cert.payout_amount,
        issued_at=cert.created_at,
        sha256_signature=cert.sha256_signature,
        is_revoked=cert.is_revoked,
        revocation_reason=cert.revocation_reason,
        issuer="MaxFunded",
        verification_url=verification_url,
    )


@router.get(
    "/my",
    response_model=List[CertificateResponse],
    summary="List all certificates issued to the authenticated trader",
)
async def get_my_certificates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all issued certificates for the logged-in trader (auto-syncs any newly passed milestones)."""
    # Auto-mint certificates for any challenges or payouts that have passed
    return await cert_service.auto_sync_certificates_for_user(db, current_user.id)


@router.post(
    "/auto-generate/{purchase_id}",
    response_model=List[CertificateResponse],
    summary="Auto-evaluate and generate certificates for a passed challenge purchase",
)
async def auto_generate_certificates_for_purchase(
    purchase_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates a specific challenge purchase and automatically issues any earned certificates
    (e.g., Phase 1 Pass, Phase 2 Pass, Funded Trader).
    """
    stmt = (
        select(ChallengePurchase)
        .options(selectinload(ChallengePurchase.challenge))
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge purchase not found",
        )

    # Must be owner or admin
    is_admin = current_user.role in [RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN, RoleName.ADMIN]
    if purchase.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to generate certificates for this account",
        )

    certs = await cert_service.auto_sync_for_purchase(db, purchase)
    return certs


@router.post(
    "/admin/issue",
    response_model=CertificateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin endpoint to issue a certificate for a milestone",
)
async def admin_issue_certificate(
    payload: CertificateIssueRequest,
    current_user: User = Depends(
        require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN, RoleName.FINANCE_ADMIN])
    ),
    db: AsyncSession = Depends(get_db),
):
    """Issue and cryptographically sign a certificate for an account milestone."""
    return await cert_service.issue_certificate(
        db=db,
        purchase_id=payload.purchase_id,
        cert_type=payload.certificate_type,
        payout_amount=payload.payout_amount,
    )


@router.post(
    "/admin/{certificate_id}/revoke",
    response_model=CertificateResponse,
    summary="Admin endpoint to revoke a certificate",
)
async def admin_revoke_certificate(
    certificate_id: str,
    payload: CertificateRevokeRequest,
    current_user: User = Depends(
        require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN, RoleName.COMPLIANCE_ADMIN])
    ),
    db: AsyncSession = Depends(get_db),
):
    """Revoke a certificate due to post-issue breach or compliance flags."""
    return await cert_service.revoke_certificate(
        db=db,
        certificate_id=certificate_id,
        reason=payload.reason,
    )
