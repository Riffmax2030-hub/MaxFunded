from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    accepted_terms: bool
    accepted_privacy: bool
    accepted_risk_disclosure: bool


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    role: str
    kyc_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    kyc_status: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
