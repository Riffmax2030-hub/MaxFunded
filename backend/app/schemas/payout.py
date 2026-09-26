from __future__ import annotations
from decimal import Decimal
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from app.models.payout import PayoutMethod, PayoutStatus


class PayoutEligibilityResponse(BaseModel):
    purchase_id: str
    challenge_name: str
    starting_balance: Decimal
    current_balance: Decimal
    current_equity: Decimal
    gross_profit: Decimal
    profit_split_percentage: Decimal
    eligible_trader_amount: Decimal
    company_fee_amount: Decimal
    kyc_approved: bool
    is_eligible: bool
    ineligibility_reasons: List[str] = Field(default_factory=list)


class PayoutRequestCreate(BaseModel):
    purchase_id: str
    amount: Optional[Decimal] = Field(None, ge=Decimal("50.00"), description="Gross profit withdrawal amount. If omitted, takes full eligible profit.")
    method: PayoutMethod
    payout_details: Dict[str, Any] = Field(
        ...,
        description="Withdrawal destination (e.g. crypto address, bank account number/swift, etc.)"
    )

    @field_validator("payout_details")
    @classmethod
    def validate_payout_details(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        if not v:
            raise ValueError("Payout details cannot be empty")
        return v


class PayoutRequestResponse(BaseModel):
    id: str
    user_id: str
    purchase_id: str
    amount: Decimal
    trader_amount: Decimal
    company_fee_amount: Decimal
    profit_split_percentage: Decimal
    currency: str
    method: PayoutMethod
    payout_details: Dict[str, Any]
    status: PayoutStatus
    tx_hash_or_reference: Optional[str]
    rejection_reason: Optional[str]
    admin_notes: Optional[str]
    reviewer_id: Optional[str]
    requested_at: datetime
    reviewed_at: Optional[datetime]
    processed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminPayoutReviewRequest(BaseModel):
    status: PayoutStatus = Field(..., description="Target status: UNDER_REVIEW, APPROVED, PROCESSING, PAID, REJECTED")
    tx_hash_or_reference: Optional[str] = None
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: PayoutStatus) -> PayoutStatus:
        if v not in (PayoutStatus.UNDER_REVIEW, PayoutStatus.APPROVED, PayoutStatus.PROCESSING, PayoutStatus.PAID, PayoutStatus.REJECTED):
            raise ValueError("Invalid target status for review")
        return v
