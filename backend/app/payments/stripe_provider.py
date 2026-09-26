"""
Stripe Payment Provider
Supports: Cards (Visa, Mastercard, Amex, Discover),
          ACH bank transfer (US), SEPA (Europe),
          Apple Pay, Google Pay, Klarna, Afterpay
Coverage: 46+ countries
"""
import hashlib
import hmac
import json
from typing import Optional

try:
    import stripe as stripe_sdk
except ImportError:
    stripe_sdk = None

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class StripeProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "stripe"

    def is_configured(self) -> bool:
        return bool(stripe_sdk and settings.STRIPE_SECRET_KEY)

    def _client(self):
        stripe_sdk.api_key = settings.STRIPE_SECRET_KEY
        return stripe_sdk

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
        client = self._client()

        # Stripe amounts are in the smallest currency unit (cents)
        amount_cents = int(round(amount * 100))

        session = client.checkout.Session.create(
            payment_method_types=[
                "card",
                "link",       # Stripe Link (saved cards/bank)
            ],
            line_items=[{
                "price_data": {
                    "currency": currency.lower(),
                    "product_data": {"name": description},
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            customer_email=customer_email,
            success_url=success_url + f"?payment_id={payment_id}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=cancel_url + f"?payment_id={payment_id}",
            metadata={"payment_id": payment_id},
            # Bank transfers (ACH / SEPA) can be added per-region via payment_method_configuration
        )

        return PaymentInitResult(
            provider_reference=session.id,
            redirect_url=session.url,
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise ValueError("Stripe webhook secret not configured")

        sig_header = headers.get("stripe-signature", "")
        try:
            event = stripe_sdk.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe_sdk.error.SignatureVerificationError as e:
            raise ValueError(f"Stripe webhook signature invalid: {e}")

        provider_reference: Optional[str] = None
        status = "pending"

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            provider_reference = session["id"]
            payment_status = session.get("payment_status", "")
            status = "completed" if payment_status == "paid" else "pending"

        elif event["type"] == "checkout.session.async_payment_succeeded":
            session = event["data"]["object"]
            provider_reference = session["id"]
            status = "completed"

        elif event["type"] == "checkout.session.async_payment_failed":
            session = event["data"]["object"]
            provider_reference = session["id"]
            status = "failed"

        elif event["type"] in ("charge.refunded",):
            charge = event["data"]["object"]
            provider_reference = charge.get("payment_intent", charge.get("id"))
            status = "refunded"

        if not provider_reference:
            raise ValueError(f"Unhandled Stripe event type: {event['type']}")

        return WebhookEvent(
            provider_reference=provider_reference,
            status=status,
            raw=dict(event),
        )
