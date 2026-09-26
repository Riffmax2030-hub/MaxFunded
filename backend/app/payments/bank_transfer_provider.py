"""
Bank Transfer Provider (Direct Wire / SWIFT / Local Bank Transfer)
Supports: SWIFT International Wire, ACH, Local Bank Deposits
Coverage: Worldwide
Workflow:
1. System issues a unique Reference Code (e.g. RMF-W-A8B9C2D1)
2. Trader transfers funds from their bank with the Reference Code in the description/memo
3. Payment enters 'AWAITING_CONFIRMATION' status
4. Finance Admin verifies incoming funds and confirms payment via Admin Portal
5. System auto-provisions and activates the trader's challenge account
"""
import uuid
from typing import Optional

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class BankTransferProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "bank_transfer"

    def is_configured(self) -> bool:
        return bool(settings.BANK_TRANSFER_ENABLED and settings.BANK_NAME and settings.BANK_ACCOUNT_NUMBER)

    async def initiate_payment(
        self,
        *,
        amount: float,
        currency: str,
        description: str,
        customer_email: str,
        payment_id: str,
        success_url: str,
        cancel_url: str,
        webhook_url: str,
    ) -> PaymentInitResult:
        # Generate a memorable, unique reference code
        short_id = uuid.uuid4().hex[:8].upper()
        reference_code = f"RMF-W-{short_id}"

        bank_details = {
            "bank_name": settings.BANK_NAME,
            "account_name": settings.BANK_ACCOUNT_NAME,
            "account_number": settings.BANK_ACCOUNT_NUMBER,
            "swift_bic": settings.BANK_SWIFT_BIC,
            "iban": settings.BANK_IBAN or "N/A",
            "routing_number": settings.BANK_ROUTING or "N/A",
            "currency": settings.BANK_CURRENCY,
            "amount_expected": amount,
            "reference_code": reference_code,
            "instructions": f"{settings.BANK_INSTRUCTIONS} (Your Reference: {reference_code})",
        }

        return PaymentInitResult(
            provider_reference=reference_code,
            payment_reference_code=reference_code,
            bank_details=bank_details,
            extra={"status": "awaiting_wire_confirmation"},
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        # Bank wire doesn't use standard webhook; it's confirmed via Admin API
        raise NotImplementedError("Bank wire payments are confirmed via administrative compliance action.")
