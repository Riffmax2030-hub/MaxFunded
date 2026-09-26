import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.kyc import (
    KYCVerification,
    KYCDocument,
    KYCStatus,
    KYCVendor,
    AMLStatus,
    DocumentType,
)
from app.models.audit import AuditLog
from app.schemas.kyc import (
    KYCSubmissionRequest,
    AdminKYCReviewRequest,
)

# OFAC & FATF High-Risk Jurisdictions
SANCTIONED_COUNTRIES = {
    "CU",  # Cuba
    "IR",  # Iran
    "KP",  # North Korea
    "SY",  # Syria
    "RU",  # Russia (Sanctions)
    "BY",  # Belarus (Sanctions)
    "MM",  # Myanmar (FATF Blacklist)
    "VE",  # Venezuela (Designated Sanctions)
}


class KYCComplianceService:
    """
    Enterprise KYC / AML Verification & Identity Compliance Engine.
    Handles international trader identity onboarding, document cataloging,
    sanctions screening, PEP evaluation, and administrative approval workflows.
    """

    @classmethod
    def screen_aml(
        cls,
        nationality: Optional[str],
        residence_country: Optional[str],
        is_politically_exposed: bool,
    ) -> Tuple[AMLStatus, Decimal, bool, bool, List[str]]:
        """
        Executes real-time AML / PEP / Sanctions screening.
        Returns (aml_status, risk_score, pep_passed, sanctions_passed, flags).
        """
        flags = []
        risk_score = Decimal("5.00")  # Base baseline risk
        sanctions_passed = True
        pep_passed = True

        nat = (nationality or "").upper()
        res = (residence_country or "").upper()

        # 1. Sanctions & High-Risk Jurisdictions Check
        if nat in SANCTIONED_COUNTRIES or res in SANCTIONED_COUNTRIES:
            sanctions_passed = False
            risk_score += Decimal("85.00")
            flags.append(f"Sanctioned jurisdiction match: {nat if nat in SANCTIONED_COUNTRIES else res}")

        # 2. Politically Exposed Person (PEP) Check
        if is_politically_exposed:
            pep_passed = False
            risk_score += Decimal("30.00")
            flags.append("Trader self-declared as Politically Exposed Person (PEP)")

        # Cap risk score at 100.00
        risk_score = min(Decimal("100.00"), risk_score)

        # Determine AML Status
        if not sanctions_passed:
            aml_status = AMLStatus.HIGH_RISK
        elif not pep_passed or risk_score >= Decimal("40.00"):
            aml_status = AMLStatus.FLAGGED
        else:
            aml_status = AMLStatus.CLEAR

        return aml_status, risk_score, pep_passed, sanctions_passed, flags

    @classmethod
    async def get_or_create_dossier(
        cls,
        user_id: str,
        db: AsyncSession,
    ) -> KYCVerification:
        """Retrieves existing verification record or creates a clean draft."""
        stmt = (
            select(KYCVerification)
            .options(selectinload(KYCVerification.documents))
            .where(KYCVerification.user_id == user_id)
            .order_by(desc(KYCVerification.created_at))
        )
        res = await db.execute(stmt)
        verification = res.scalars().first()

        if not verification:
            verification = KYCVerification(
                user_id=user_id,
                status=KYCStatus.NOT_SUBMITTED,
                vendor=KYCVendor.MANUAL_REVIEW,
                aml_status=AMLStatus.PENDING,
                aml_risk_score=Decimal("0.00"),
                pep_check_passed=True,
                sanctions_check_passed=True,
                is_politically_exposed=False,
            )
            db.add(verification)
            await db.flush()
            await db.refresh(verification, ["documents"])

        return verification

    @classmethod
    async def submit_verification(
        cls,
        user: User,
        payload: KYCSubmissionRequest,
        db: AsyncSession,
    ) -> KYCVerification:
        """
        Processes trader identity submission:
        - Catalogs identity details & attached documents
        - Performs automated real-time AML / PEP / Sanctions screening
        - Transitions verification status to PENDING_REVIEW
        - Updates User.kyc_status
        """
        # Fetch or create dossier
        verification = await cls.get_or_create_dossier(user.id, db)

        # Run AML / PEP / Sanctions screen
        aml_status, risk_score, pep_passed, sanctions_passed, flags = cls.screen_aml(
            nationality=payload.nationality,
            residence_country=payload.residence_country,
            is_politically_exposed=payload.is_politically_exposed,
        )

        now = datetime.datetime.now(datetime.timezone.utc)

        # Update verification fields
        verification.first_name = payload.first_name
        verification.last_name = payload.last_name
        verification.date_of_birth = payload.date_of_birth
        verification.nationality = payload.nationality
        verification.residence_country = payload.residence_country
        verification.address_line = payload.address_line
        verification.city = payload.city
        verification.postal_code = payload.postal_code
        verification.is_politically_exposed = payload.is_politically_exposed

        verification.aml_status = aml_status
        verification.aml_risk_score = risk_score
        verification.pep_check_passed = pep_passed
        verification.sanctions_check_passed = sanctions_passed
        verification.status = KYCStatus.PENDING_REVIEW
        verification.submitted_at = now
        verification.rejection_reason = None  # Clear any previous retry/rejection reasons

        # Sync User model
        user.kyc_status = KYCStatus.PENDING_REVIEW.value

        # Catalog attached documents
        for doc_item in payload.documents:
            doc = KYCDocument(
                verification_id=verification.id,
                user_id=user.id,
                document_type=doc_item.document_type,
                document_number=doc_item.document_number,
                issuing_country=doc_item.issuing_country,
                file_name=doc_item.file_name,
                file_url=doc_item.file_url,
                mime_type=doc_item.mime_type,
                file_size_bytes=doc_item.file_size_bytes,
                is_front=doc_item.is_front,
            )
            verification.documents.append(doc)

        audit = AuditLog(
            action="KYC_SUBMITTED",
            actor_id=user.id,
            actor_email=user.email,
            target_type="KYC_VERIFICATION",
            target_id=verification.id,
            new_value=f"Submitted KYC: {payload.first_name} {payload.last_name} ({payload.nationality}), AML: {aml_status.value} (Risk: {risk_score})",
        )
        db.add(audit)

        await db.commit()

        # Eagerly reload with documents to prevent async lazy-load serialization errors
        reload_stmt = (
            select(KYCVerification)
            .options(selectinload(KYCVerification.documents))
            .where(KYCVerification.id == verification.id)
        )
        reload_res = await db.execute(reload_stmt)
        return reload_res.scalar_one()



    @classmethod
    async def review_verification(
        cls,
        verification_id: str,
        reviewer: User,
        payload: AdminKYCReviewRequest,
        db: AsyncSession,
    ) -> KYCVerification:
        """
        Applies Compliance Admin or Super Admin review determination.
        Syncs User.kyc_status and User.is_verified flags.
        """
        stmt = (
            select(KYCVerification)
            .options(
                selectinload(KYCVerification.documents),
                selectinload(KYCVerification.user),
            )
            .where(KYCVerification.id == verification_id)
        )
        res = await db.execute(stmt)
        verification = res.scalar_one_or_none()

        if not verification:
            raise HTTPException(status_code=404, detail="KYC verification dossier not found")

        now = datetime.datetime.now(datetime.timezone.utc)
        prev_status = verification.status

        verification.status = payload.status
        verification.reviewer_id = reviewer.id
        verification.reviewer_notes = payload.reviewer_notes
        verification.rejection_reason = payload.rejection_reason if payload.status in (KYCStatus.REJECTED, KYCStatus.REQUIRES_RETRY) else None
        verification.reviewed_at = now

        # Update User
        target_user = verification.user
        if target_user:
            if payload.status == KYCStatus.APPROVED:
                target_user.kyc_status = "APPROVED"
                target_user.is_verified = True
                verification.expires_at = now + datetime.timedelta(days=365)  # 1 year validity
            elif payload.status == KYCStatus.REJECTED:
                target_user.kyc_status = "REJECTED"
                target_user.is_verified = False
            elif payload.status == KYCStatus.REQUIRES_RETRY:
                target_user.kyc_status = "PENDING"
                target_user.is_verified = False

        audit = AuditLog(
            action=f"KYC_{payload.status.value}",
            actor_id=reviewer.id,
            actor_email=reviewer.email,
            target_type="KYC_VERIFICATION",
            target_id=verification.id,
            previous_value=str(prev_status.value if hasattr(prev_status, "value") else prev_status),
            new_value=f"Status: {payload.status.value}, Notes: {payload.reviewer_notes}",
            reason=payload.rejection_reason,
        )
        db.add(audit)

        await db.commit()

        # Eagerly reload with documents to prevent async lazy-load serialization errors
        reload_stmt = (
            select(KYCVerification)
            .options(selectinload(KYCVerification.documents))
            .where(KYCVerification.id == verification.id)
        )
        reload_res = await db.execute(reload_stmt)
        return reload_res.scalar_one()


    @classmethod
    def enforce_kyc_approved(cls, user: User) -> None:
        """
        Compliance guard ensuring user has APPROVED identity verification.
        Required prior to issuing profit payouts or real live capital allocations.
        """
        if user.kyc_status != "APPROVED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation prohibited: Identity Verification (KYC) required. Current status: {user.kyc_status}",
            )


kyc_service = KYCComplianceService()
