import enum
from decimal import Decimal
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Integer,
    ForeignKey,
    DateTime,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class DocumentType(str, enum.Enum):
    PASSPORT = "PASSPORT"
    NATIONAL_ID = "NATIONAL_ID"
    DRIVERS_LICENSE = "DRIVERS_LICENSE"
    PROOF_OF_ADDRESS = "PROOF_OF_ADDRESS"
    UTILITY_BILL = "UTILITY_BILL"
    BANK_STATEMENT = "BANK_STATEMENT"


class KYCStatus(str, enum.Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REQUIRES_RETRY = "REQUIRES_RETRY"


class KYCVendor(str, enum.Enum):
    MANUAL_REVIEW = "MANUAL_REVIEW"
    SUMSUB = "SUMSUB"
    VERIFF = "VERIFF"
    SMILE_IDENTITY = "SMILE_IDENTITY"


class AMLStatus(str, enum.Enum):
    CLEAR = "CLEAR"
    FLAGGED = "FLAGGED"
    PENDING = "PENDING"
    HIGH_RISK = "HIGH_RISK"


class KYCVerification(BaseModel):
    """
    Primary KYC and AML verification dossier for a trader.
    Manages identity lifecycle, vendor synchronization, and compliance audit trail.
    """
    __tablename__ = "kyc_verifications"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(
        SAEnum(KYCStatus, name="kycstatus"),
        default=KYCStatus.NOT_SUBMITTED,
        nullable=False,
        index=True,
    )
    vendor = Column(
        SAEnum(KYCVendor, name="kycvendor"),
        default=KYCVendor.MANUAL_REVIEW,
        nullable=False,
    )
    vendor_applicant_id = Column(String(128), nullable=True, index=True)
    
    # AML, PEP & Sanctions Screening
    aml_status = Column(
        SAEnum(AMLStatus, name="amlstatus"),
        default=AMLStatus.PENDING,
        nullable=False,
    )
    aml_risk_score = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)  # 0.00 to 100.00
    pep_check_passed = Column(Boolean, default=True, nullable=False)  # False if Politically Exposed Person
    sanctions_check_passed = Column(Boolean, default=True, nullable=False)  # False if matched on OFAC/UN/EU lists
    is_politically_exposed = Column(Boolean, default=False, nullable=False)
    
    # Identity Information
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    date_of_birth = Column(String(20), nullable=True)  # YYYY-MM-DD
    nationality = Column(String(2), nullable=True)  # ISO 3166-1 alpha-2
    residence_country = Column(String(2), nullable=True)
    address_line = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)

    # Reviewer Decisions
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="kyc_verifications")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    documents = relationship("KYCDocument", back_populates="verification", cascade="all, delete-orphan")


class KYCDocument(BaseModel):
    """
    Secure document asset record uploaded by trader or retrieved via identity vendor.
    """
    __tablename__ = "kyc_documents"

    verification_id = Column(String(36), ForeignKey("kyc_verifications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    document_type = Column(
        SAEnum(DocumentType, name="documenttype"),
        nullable=False,
    )
    document_number = Column(String(100), nullable=True)
    issuing_country = Column(String(2), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)  # Local storage path or encrypted S3/GCS URL
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    is_front = Column(Boolean, default=True, nullable=False)

    # Relationship
    verification = relationship("KYCVerification", back_populates="documents")
    user = relationship("User")
