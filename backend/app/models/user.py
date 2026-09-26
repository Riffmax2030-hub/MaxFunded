from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    country = Column(String(2), nullable=False, index=True)  # ISO 3166-1 alpha-2 code
    phone = Column(String(50), nullable=True)
    
    # Status flags
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    role = Column(String(50), default="TRADER", nullable=False)  # TRADER, SUPER_ADMIN, etc.
    
    # KYC status
    kyc_status = Column(String(50), default="NOT_REQUIRED", nullable=False)  # NOT_REQUIRED, PENDING, APPROVED, REJECTED
    
    # Compliance & Legal tracking
    accepted_terms = Column(Boolean, default=False, nullable=False)
    accepted_privacy = Column(Boolean, default=False, nullable=False)
    accepted_risk_disclosure = Column(Boolean, default=False, nullable=False)
    terms_version = Column(String(20), default="v1.0", nullable=False)
    
    # Relationships
    purchases = relationship("ChallengePurchase", back_populates="user", cascade="all, delete-orphan")
