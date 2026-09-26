"""
NowPayments Cryptocurrency Provider
Supports: BTC, ETH, USDT (TRC-20, ERC-20, BEP-20), LTC, SOL, XRP, DOGE, 300+ coins
Coverage: Worldwide borderless crypto payments
"""
import hashlib
import hmac
import json
import httpx
from typing import Optional

from app.core.config import settings
from app.payments.base import BasePaymentProvider, PaymentInitResult, WebhookEvent


class NowPaymentsProvider(BasePaymentProvider):

    @property
    def name(self) -> str:
        return "nowpayments"

    def is_configured(self) -> bool:
        return bool(settings.NOWPAYMENTS_API_KEY)

    @property
    def _base_url(self) -> str:
        if settings.NOWPAYMENTS_SANDBOX:
            return "https://api-sandbox.nowpayments.io/v1"
        return "https://api.nowpayments.io/v1"

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
        # Default crypto currency is USDTTRC20 (lowest fees for traders) or BTC
        pay_currency = "usdttrc20"

        payload = {
            "price_amount": amount,
            "price_currency": currency.lower(),
            "pay_currency": pay_currency,
            "ipn_callback_url": webhook_url,
            "order_id": payment_id,
            "order_description": description,
            "customer_email": customer_email,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self._base_url}/payment",
                headers={
                    "x-api-key": settings.NOWPAYMENTS_API_KEY,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json()

        payment_external_id = str(data.get("payment_id"))
        pay_address = data.get("pay_address")
        pay_amount = float(data.get("pay_amount", 0))
        crypto_curr = data.get("pay_currency", pay_currency).upper()

        # Generate a standard crypto payment QR URL or fallback
        qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={pay_address}"

        return PaymentInitResult(
            provider_reference=payment_external_id,
            redirect_url=None,  # Handled on-page with wallet address & QR code
            crypto_address=pay_address,
            crypto_amount=pay_amount,
            crypto_currency=crypto_curr,
            qr_code_url=qr_code_url,
            extra=data,
        )

    async def verify_webhook(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        data = json.loads(payload.decode("utf-8"))

        if settings.NOWPAYMENTS_IPN_SECRET:
            # NowPayments sorts keys alphabetically and computes HMAC-SHA512
            sorted_data = json.dumps(data, sort_keys=True, separators=(",", ":"))
            expected_sig = hmac.new(
                settings.NOWPAYMENTS_IPN_SECRET.encode("utf-8"),
                sorted_data.encode("utf-8"),
                hashlib.sha512,
            ).hexdigest()

            actual_sig = headers.get("x-nowpayments-sig")
            if actual_sig != expected_sig:
                raise ValueError("Invalid NowPayments IPN signature")

        payment_status = data.get("payment_status", "").lower()
        payment_id = str(data.get("payment_id") or data.get("order_id", ""))

        status = "pending"
        if payment_status in ("finished", "confirmed"):
            status = "completed"
        elif payment_status in ("failed", "expired"):
            status = "failed"
        elif payment_status == "refunded":
            status = "refunded"
        elif payment_status in ("waiting", "confirming", "sending"):
            status = "pending"

        amount = data.get("price_amount")
        currency = data.get("price_currency")

        return WebhookEvent(
            provider_reference=payment_id,
            status=status,
            amount=float(amount) if amount else None,
            currency=currency.upper() if currency else None,
            raw=data,
        )
