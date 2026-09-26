"""
Pydantic Schemas for Phase 9: Cryptographic Certificate Generation & Public Verification.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from app.models.certificate import CertificateType


class CertificateIssueRequest(BaseModel):
    purchase_id: str
    certificate_type: CertificateType
    payout_amount: Optional[Decimal] = None


class CertificateRevokeRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500)


class CertificateResponse(BaseModel):
    id: str
    certificate_code: str
    user_id: str
    purchase_id: str
    certificate_type: CertificateType
    trader_name: str
    challenge_name: str
    account_size: Decimal
    payout_amount: Optional[Decimal] = None
    sha256_signature: str
    is_revoked: bool
    revocation_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CertificatePublicVerifyResponse(BaseModel):
    is_valid: bool
    certificate_code: str
    certificate_type: CertificateType
    trader_name: str
    challenge_name: str
    account_size: Decimal
    payout_amount: Optional[Decimal] = None
    issued_at: datetime
    sha256_signature: str
    is_revoked: bool
    revocation_reason: Optional[str] = None
    issuer: str = "Riffmax Funding"
    verification_url: str

    model_config = {"from_attributes": True}
