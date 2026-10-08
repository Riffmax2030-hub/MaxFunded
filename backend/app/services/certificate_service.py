"""
Phase 9: Cryptographic Certificate Generation & Verification Service.
Guarantees tamper-proof validation of trader milestones with SHA-256 signatures.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.certificate import Certificate, CertificateType
from app.models.challenge import ChallengePurchase, Challenge
from app.models.user import User


class CertificateService:
    SECRET_SALT = getattr(settings, "SECRET_KEY", "riffmax-secret-salt-2026-secure")

    @classmethod
    def generate_certificate_code(cls, cert_type: CertificateType) -> str:
        """Generates a memorable and distinct certificate identifier."""
        prefix_map = {
            CertificateType.PHASE_1_PASSED: "P1",
            CertificateType.PHASE_2_PASSED: "P2",
            CertificateType.FUNDED_TRADER: "FND",
            CertificateType.PAYOUT_ACHIEVER: "PAY",
        }
        prefix = prefix_map.get(cert_type, "CRT")
        year = datetime.now(timezone.utc).year
        random_hex = secrets.token_hex(4).upper()
        return f"MXF-{prefix}-{year}-{random_hex}"

    @classmethod
    def compute_sha256_signature(
        cls,
        code: str,
        user_id: str,
        purchase_id: str,
        cert_type: str,
        account_size: str,
        timestamp_str: str,
    ) -> str:
        """Computes a deterministic HMAC-SHA256 signature to prevent certificate forgery."""
        payload = f"{code}|{user_id}|{purchase_id}|{cert_type}|{account_size}|{timestamp_str}".encode("utf-8")
        salt = cls.SECRET_SALT.encode("utf-8")
        return hmac.new(salt, payload, hashlib.sha256).hexdigest()

    async def issue_certificate(
        self,
        db: AsyncSession,
        purchase_id: str,
        cert_type: CertificateType,
        payout_amount: Optional[Decimal] = None,
    ) -> Certificate:
        """Issues and cryptographically signs a certificate for a trader purchase milestone."""
        stmt = (
            select(ChallengePurchase)
            .options(
                selectinload(ChallengePurchase.user),
                selectinload(ChallengePurchase.challenge),
            )
            .where(ChallengePurchase.id == purchase_id)
        )
        res = await db.execute(stmt)
        purchase = res.scalar_one_or_none()
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Challenge purchase {purchase_id} not found",
            )

        code = self.generate_certificate_code(cert_type)
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        account_size_dec = Decimal(str(purchase.challenge.starting_balance))
        trader_name = purchase.user.full_name or purchase.user.email.split("@")[0].title()
        challenge_name = purchase.challenge.name

        sig = self.compute_sha256_signature(
            code=code,
            user_id=purchase.user_id,
            purchase_id=purchase.id,
            cert_type=cert_type.value,
            account_size=str(account_size_dec),
            timestamp_str=now_iso,
        )

        cert = Certificate(
            certificate_code=code,
            user_id=purchase.user_id,
            purchase_id=purchase.id,
            certificate_type=cert_type,
            trader_name=trader_name,
            challenge_name=challenge_name,
            account_size=account_size_dec,
            payout_amount=payout_amount,
            sha256_signature=sig,
            is_revoked=False,
        )
        db.add(cert)
        await db.commit()
        await db.refresh(cert)
        return cert

    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Certificate]:
        """Look up certificate by its public code."""
        stmt = select(Certificate).where(Certificate.certificate_code == code.strip().upper())
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_certificates(self, db: AsyncSession, user_id: str) -> List[Certificate]:
        """Fetch all certificates belonging to a trader ordered by date descending."""
        stmt = (
            select(Certificate)
            .where(Certificate.user_id == user_id)
            .order_by(desc(Certificate.created_at))
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_or_issue_certificate(
        self,
        db: AsyncSession,
        purchase_id: str,
        cert_type: CertificateType,
        payout_amount: Optional[Decimal] = None,
    ) -> Certificate:
        """
        Idempotent certificate generation.
        Returns existing active certificate if already issued for this milestone,
        or creates, signs, and commits a brand new verifiable certificate.
        """
        stmt = (
            select(Certificate)
            .where(
                Certificate.purchase_id == purchase_id,
                Certificate.certificate_type == cert_type,
                Certificate.is_revoked == False,
            )
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return existing

        return await self.issue_certificate(
            db=db,
            purchase_id=purchase_id,
            cert_type=cert_type,
            payout_amount=payout_amount,
        )

    async def auto_sync_for_purchase(
        self,
        db: AsyncSession,
        purchase: ChallengePurchase,
    ) -> List[Certificate]:
        """
        Evaluates a challenge purchase and automatically issues earned milestone certificates:
        - Phase 1 Passed: TARGET_REACHED, PASSED, UNDER_REVIEW, FUNDED, or passed_at set
        - Phase 2 Passed: PASSED, FUNDED, or PAYOUT_*
        - Funded Trader: FUNDED or PAYOUT_*
        """
        issued: List[Certificate] = []
        status = str(purchase.status or "").upper()
        has_passed_target = (
            status in ("TARGET_REACHED", "PASSED", "UNDER_REVIEW", "FUNDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID")
            or purchase.passed_at is not None
        )

        if has_passed_target:
            c1 = await self.get_or_issue_certificate(
                db=db,
                purchase_id=purchase.id,
                cert_type=CertificateType.PHASE_1_PASSED,
            )
            issued.append(c1)

        if status in ("PASSED", "FUNDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID"):
            c2 = await self.get_or_issue_certificate(
                db=db,
                purchase_id=purchase.id,
                cert_type=CertificateType.PHASE_2_PASSED,
            )
            issued.append(c2)

        if status in ("FUNDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID"):
            c3 = await self.get_or_issue_certificate(
                db=db,
                purchase_id=purchase.id,
                cert_type=CertificateType.FUNDED_TRADER,
            )
            issued.append(c3)

        return issued

    async def auto_sync_certificates_for_user(
        self,
        db: AsyncSession,
        user_id: str,
    ) -> List[Certificate]:
        """
        Automatically scans all challenge purchases and completed payouts for a user,
        minting any missing milestone certificates seamlessly.
        """
        stmt = (
            select(ChallengePurchase)
            .options(selectinload(ChallengePurchase.challenge))
            .where(ChallengePurchase.user_id == user_id)
        )
        res = await db.execute(stmt)
        purchases = res.scalars().all()

        for p in purchases:
            await self.auto_sync_for_purchase(db, p)

        # Also scan paid payouts
        from app.models.payout import PayoutRequest, PayoutStatus
        payout_stmt = (
            select(PayoutRequest)
            .where(PayoutRequest.user_id == user_id, PayoutRequest.status == PayoutStatus.PAID)
        )
        p_res = await db.execute(payout_stmt)
        paid_payouts = p_res.scalars().all()

        for po in paid_payouts:
            if po.purchase_id:
                await self.get_or_issue_certificate(
                    db=db,
                    purchase_id=po.purchase_id,
                    cert_type=CertificateType.PAYOUT_ACHIEVER,
                    payout_amount=Decimal(str(po.amount)),
                )

        return await self.get_user_certificates(db, user_id)

    async def revoke_certificate(
        self,
        db: AsyncSession,
        certificate_id: str,
        reason: str,
    ) -> Certificate:
        """Revokes a certificate (e.g. breach detected after the fact or fraudulent activity)."""
        stmt = select(Certificate).where(Certificate.id == certificate_id)
        res = await db.execute(stmt)
        cert = res.scalar_one_or_none()
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Certificate {certificate_id} not found",
            )

        cert.is_revoked = True
        cert.revocation_reason = reason
        cert.revoked_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(cert)
        return cert


certificate_service = CertificateService()


