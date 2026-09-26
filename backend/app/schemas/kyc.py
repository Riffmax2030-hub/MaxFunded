from __future__ import annotations
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from app.models.kyc import (
    DocumentType,
    KYCStatus,
    KYCVendor,
    AMLStatus,
)


class KYCDocumentUploadRequest(BaseModel):
    document_type: DocumentType
    document_number: Optional[str] = Field(None, max_length=100)
    issuing_country: Optional[str] = Field(None, min_length=2, max_length=2)
    file_name: str = Field(..., min_length=1, max_length=255)
    file_url: str = Field(..., min_length=1, max_length=500)
    mime_type: str = Field("application/pdf", max_length=100)
    file_size_bytes: int = Field(0, ge=0)
    is_front: bool = True


class KYCDocumentResponse(BaseModel):
    id: str
    verification_id: str
    user_id: str
    document_type: DocumentType
    document_number: Optional[str]
    issuing_country: Optional[str]
    file_name: str
    file_url: str
    mime_type: str
    file_size_bytes: int
    is_front: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class KYCSubmissionRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="YYYY-MM-DD format")
    nationality: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 code")
    residence_country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 code")
    address_line: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    is_politically_exposed: bool = False
    documents: List[KYCDocumentUploadRequest] = Field(default_factory=list)

    @field_validator("nationality", "residence_country")
    @classmethod
    def uppercase_country(cls, v: str) -> str:
        return v.upper()


class KYCVerificationResponse(BaseModel):
    id: str
    user_id: str
    status: KYCStatus
    vendor: KYCVendor
    vendor_applicant_id: Optional[str]
    aml_status: AMLStatus
    aml_risk_score: Decimal
    pep_check_passed: bool
    sanctions_check_passed: bool
    is_politically_exposed: bool
    first_name: Optional[str]
    last_name: Optional[str]
    date_of_birth: Optional[str]
    nationality: Optional[str]
    residence_country: Optional[str]
    address_line: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    reviewer_id: Optional[str]
    reviewer_notes: Optional[str]
    rejection_reason: Optional[str]
    reviewed_at: Optional[datetime]
    submitted_at: Optional[datetime]
    created_at: datetime
    documents: List[KYCDocumentResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class KYCSummaryResponse(BaseModel):
    user_id: str
    kyc_status: str
    aml_status: str
    is_verified: bool
    verification_id: Optional[str]
    documents_count: int
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    reviewer_notes: Optional[str]
    rejection_reason: Optional[str]
    requires_action: bool


class AdminKYCReviewRequest(BaseModel):
    status: KYCStatus = Field(..., description="Target status: APPROVED, REJECTED, or REQUIRES_RETRY")
    reviewer_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_target_status(cls, v: KYCStatus) -> KYCStatus:
        if v not in (KYCStatus.APPROVED, KYCStatus.REJECTED, KYCStatus.REQUIRES_RETRY):
            raise ValueError("Target review status must be APPROVED, REJECTED, or REQUIRES_RETRY")
        return v


class AMLScreeningResultResponse(BaseModel):
    verification_id: str
    user_id: str
    aml_status: AMLStatus
    aml_risk_score: Decimal
    pep_check_passed: bool
    sanctions_check_passed: bool
    flags: List[str] = Field(default_factory=list)
