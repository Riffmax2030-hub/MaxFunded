"""
PayPal Payment Provider
Supports: PayPal Wallet, Credit/Debit Cards, Pay in 4, Linked Bank Accounts
Coverage: 200+ countries, 25+ currencies
"""
import base64
import json
from typing import Optional
import httpx

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class PayPalProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "paypal"

    def is_configured(self) -> bool:
        return bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET)

    @property
    def _base_url(self) -> str:
        if settings.PAYPAL_MODE == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"

    async def _get_access_token(self) -> str:
        auth_str = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}"
        encoded_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/v1/oauth2/token",
                headers={
                    "Authorization": f"Basic {encoded_auth}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
                timeout=15.0,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["access_token"]

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
        token = await self._get_access_token()
        formatted_amount = f"{amount:.2f}"

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": payment_id,
                    "description": description,
                    "amount": {
                        "currency_code": currency.upper(),
                        "value": formatted_amount,
                    },
                }
            ],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                        "brand_name": settings.APP_NAME,
                        "locale": "en-US",
                        "landing_page": "LOGIN",
                        "user_action": "PAY_NOW",
                        "return_url": success_url + f"?payment_id={payment_id}",
                        "cancel_url": cancel_url + f"?payment_id={payment_id}",
                    }
                }
            },
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json()

        order_id = data["id"]
        redirect_url = None
        for link in data.get("links", []):
            if link.get("rel") == "payer-action" or link.get("rel") == "approve":
                redirect_url = link.get("href")
                break

        return PaymentInitResult(
            provider_reference=order_id,
            redirect_url=redirect_url,
            extra={"order_id": order_id, "status": data.get("status")},
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        data = json.loads(payload.decode("utf-8"))
        event_type = data.get("event_type", "")
        resource = data.get("resource", {})

        # Order ID or capture ID
        order_id = resource.get("id")
        if not order_id and "supplementary_data" in resource:
            order_id = resource["supplementary_data"].get("related_ids", {}).get("order_id")

        status = "pending"
        amount = None
        currency = None

        if event_type == "CHECKOUT.ORDER.APPROVED" or event_type == "PAYMENT.CAPTURE.COMPLETED":
            status = "completed"
            amount_data = resource.get("amount", {})
            if amount_data:
                amount = float(amount_data.get("value", 0))
                currency = amount_data.get("currency_code")
        elif event_type in ("PAYMENT.CAPTURE.DENIED", "CHECKOUT.ORDER.VOIDED"):
            status = "failed"
        elif event_type == "PAYMENT.CAPTURE.REFUNDED":
            status = "refunded"

        return WebhookEvent(
            provider_reference=order_id or "unknown",
            status=status,
            amount=amount,
            currency=currency,
            raw=data,
        )
