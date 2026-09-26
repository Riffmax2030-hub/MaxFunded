from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PaymentInitResult:
    """Result returned from provider after initiating a payment."""
    provider_reference: str                    # External ID (Stripe session ID, PayPal order ID, etc.)
    redirect_url: Optional[str] = None         # URL to redirect user to (Stripe, PayPal, Flutterwave, Paystack)
    bank_details: Optional[dict] = None        # For bank transfer — company bank account info
    crypto_address: Optional[str] = None       # Crypto wallet address
    crypto_amount: Optional[float] = None      # Amount in crypto (e.g. 0.00035 BTC)
    crypto_currency: Optional[str] = None      # Crypto ticker (BTC, ETH, USDT_TRC20, etc.)
    qr_code_url: Optional[str] = None          # QR code image URL for crypto
    payment_reference_code: Optional[str] = None  # Unique ref code for bank transfers
    extra: dict = field(default_factory=dict)  # Provider-specific extras


@dataclass
class WebhookEvent:
    """Normalised result from a provider webhook."""
    provider_reference: str          # Maps back to Payment.provider_reference
    status: str                      # "completed" | "failed" | "pending" | "refunded"
    amount: Optional[float] = None
    currency: Optional[str] = None
    raw: dict = field(default_factory=dict)


class BasePaymentProvider(ABC):
    """
    Abstract base class for all payment providers.
    Each provider must implement: initiate_payment, verify_webhook, is_configured.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique provider slug, matches PaymentProvider enum value."""
        ...

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if all required API credentials are set."""
        ...

    @abstractmethod
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
        """
        Initiate a payment with the provider.
        Returns a PaymentInitResult with redirect URL or payment details.
        """
        ...

    @abstractmethod
    async def verify_webhook(
        self,
        *,
        payload: bytes,
        headers: dict,
    ) -> WebhookEvent:
        """
        Verify and parse an incoming webhook from the provider.
        Raises ValueError if signature is invalid.
        """
        ...
