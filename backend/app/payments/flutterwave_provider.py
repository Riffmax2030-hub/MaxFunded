"""
Flutterwave Payment Provider
Supports: International & African Cards (Visa, Mastercard, Verve),
          Direct Bank Transfer, Mobile Money (M-Pesa, MTN, Airtel, Vodafone),
          USSD, NQR
Coverage: Global cards, Africa-wide local banking & mobile money
"""
import json
import httpx
from typing import Optional

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class FlutterwaveProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "flutterwave"

    def is_configured(self) -> bool:
        return bool(settings.FLUTTERWAVE_SECRET_KEY)

    @property
    def _base_url(self) -> str:
        return "https://api.flutterwave.com/v3"

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
        tx_ref = f"riffmax_{payment_id}"

        payload = {
            "tx_ref": tx_ref,
            "amount": amount,
            "currency": currency.upper(),
            "redirect_url": success_url + f"?payment_id={payment_id}",
            "payment_options": "card,banktransfer,ussd,mobilemoneyghana,mobilemoneyuganda,mobilemoneyrwanda,mobilemoneyzambia,barter,credit",
            "meta": {
                "payment_id": payment_id,
            },
            "customer": {
                "email": customer_email,
            },
            "customizations": {
                "title": settings.APP_NAME,
                "description": description,
                "logo": f"{settings.FRONTEND_URL}/logo.png",
            },
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/payments",
                headers={
                    "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") != "success":
            raise ValueError(f"Flutterwave error: {data.get('message', 'Failed to initialize payment')}")

        redirect_url = data.get("data", {}).get("link")

        return PaymentInitResult(
            provider_reference=tx_ref,
            redirect_url=redirect_url,
            extra=data.get("data", {}),
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        secret_hash = settings.FLUTTERWAVE_SECRET_HASH
        if secret_hash:
            req_hash = headers.get("verif-hash")
            if req_hash != secret_hash:
                raise ValueError("Invalid Flutterwave webhook signature hash")

        data = json.loads(payload.decode("utf-8"))
        event_data = data.get("data", {})
        tx_ref = event_data.get("tx_ref", "")
        # Remove prefix if present
        ref_id = tx_ref.replace("riffmax_", "") if tx_ref.startswith("riffmax_") else tx_ref

        status = "pending"
        fw_status = event_data.get("status", "").lower()
        if fw_status == "successful":
            status = "completed"
        elif fw_status in ("failed", "cancelled"):
            status = "failed"

        amount = event_data.get("amount")
        currency = event_data.get("currency")

        return WebhookEvent(
            provider_reference=tx_ref or str(event_data.get("id")),
            status=status,
            amount=float(amount) if amount else None,
            currency=currency,
            raw=data,
        )
