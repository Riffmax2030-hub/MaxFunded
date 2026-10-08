from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentProvider, PaymentStatus


class PaymentInitiateRequest(BaseModel):
    challenge_id: str
    provider: PaymentProvider
    currency: Optional[str] = "USD"
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None
    pay_with_profits: Optional[bool] = False
    addons: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class BankDetailsSchema(BaseModel):
    bank_name: str
    account_name: str
    account_number: str
    swift_bic: str
    iban: Optional[str] = "N/A"
    routing_number: Optional[str] = "N/A"
    currency: str
    amount_expected: float
    reference_code: str
    instructions: str


class PaymentInitiateResponse(BaseModel):
    payment_id: str
    purchase_id: str
    provider: PaymentProvider
    status: PaymentStatus
    amount: float
    currency: str
    redirect_url: Optional[str] = None
    crypto_address: Optional[str] = None
    crypto_amount: Optional[float] = None
    crypto_currency: Optional[str] = None
    qr_code_url: Optional[str] = None
    payment_reference_code: Optional[str] = None
    bank_details: Optional[BankDetailsSchema] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentStatusResponse(BaseModel):
    id: str
    purchase_id: Optional[str]
    provider: PaymentProvider
    status: PaymentStatus
    amount: float
    currency: str
    crypto_address: Optional[str] = None
    crypto_amount: Optional[float] = None
    crypto_currency: Optional[str] = None
    payment_reference_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BankTransferConfirmRequest(BaseModel):
    admin_notes: Optional[str] = "Bank wire verified and received in company account."
