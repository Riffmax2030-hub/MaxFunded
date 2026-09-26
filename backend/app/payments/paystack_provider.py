"""
Paystack Payment Provider (a Stripe Company)
Supports: Cards (Visa, Mastercard, Verve), Direct Bank Transfer,
          USSD, Apple Pay, Mobile Money
Coverage: Nigeria, Ghana, Kenya, South Africa, plus global card acceptance
"""
import hashlib
import hmac
import json
import httpx
from typing import Optional

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class PaystackProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "paystack"

    def is_configured(self) -> bool:
        return bool(settings.PAYSTACK_SECRET_KEY)

    @property
    def _base_url(self) -> str:
        return "https://api.paystack.co"

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
        # Paystack expects amounts in lowest currency unit (e.g. cents/kobo)
        amount_kobo = int(round(amount * 100))
        reference = f"riffmax_{payment_id}"

        payload = {
            "email": customer_email,
            "amount": amount_kobo,
            "currency": currency.upper(),
            "reference": reference,
            "callback_url": success_url + f"?payment_id={payment_id}",
            "metadata": {
                "payment_id": payment_id,
                "description": description,
                "cancel_action": cancel_url + f"?payment_id={payment_id}",
            },
            "channels": ["card", "bank", "ussd", "mobile_money", "bank_transfer"],
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/transaction/initialize",
                headers={
                    "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json()

        if not data.get("status"):
            raise ValueError(f"Paystack error: {data.get('message', 'Failed to initialize payment')}")

        result_data = data.get("data", {})
        authorization_url = result_data.get("authorization_url")

        return PaymentInitResult(
            provider_reference=reference,
            redirect_url=authorization_url,
            extra=result_data,
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        if settings.PAYSTACK_SECRET_KEY:
            expected_sig = hmac.new(
                settings.PAYSTACK_SECRET_KEY.encode("utf-8"),
                payload,
                hashlib.sha512,
            ).hexdigest()

            actual_sig = headers.get("x-paystack-signature")
            if actual_sig != expected_sig:
                raise ValueError("Invalid Paystack webhook signature")

        data = json.loads(payload.decode("utf-8"))
        event = data.get("event", "")
        event_data = data.get("data", {})
        reference = event_data.get("reference", "")

        status = "pending"
        if event == "charge.success":
            status = "completed"
        elif event in ("charge.failed", "transfer.failed"):
            status = "failed"
        elif event == "refund.processed":
            status = "refunded"

        amount_cents = event_data.get("amount")
        amount = float(amount_cents) / 100.0 if amount_cents else None
        currency = event_data.get("currency")

        return WebhookEvent(
            provider_reference=reference,
            status=status,
            amount=amount,
            currency=currency,
            raw=data,
        )
