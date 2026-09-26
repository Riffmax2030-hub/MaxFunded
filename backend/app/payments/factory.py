from typing import Dict, List, Optional
from app.models.payment import PaymentProvider
from app.payments.base import BasePaymentProvider
from app.payments.stripe_provider import StripeProvider
from app.payments.paypal_provider import PayPalProvider
from app.payments.flutterwave_provider import FlutterwaveProvider
from app.payments.paystack_provider import PaystackProvider
from app.payments.nowpayments_provider import NowPaymentsProvider
from app.payments.bank_transfer_provider import BankTransferProvider


class PaymentProviderFactory:
    """Registry and factory for all worldwide payment providers."""

    _providers: Dict[str, BasePaymentProvider] = {
        PaymentProvider.STRIPE.value: StripeProvider(),
        PaymentProvider.PAYPAL.value: PayPalProvider(),
        PaymentProvider.FLUTTERWAVE.value: FlutterwaveProvider(),
        PaymentProvider.PAYSTACK.value: PaystackProvider(),
        PaymentProvider.NOWPAYMENTS.value: NowPaymentsProvider(),
        PaymentProvider.BANK_TRANSFER.value: BankTransferProvider(),
    }

    @classmethod
    def get_provider(cls, provider_name: str) -> BasePaymentProvider:
        key = provider_name.lower()
        if key not in cls._providers:
            raise ValueError(f"Unsupported payment provider: {provider_name}")
        return cls._providers[key]

    @classmethod
    def get_available_methods(cls, country_code: Optional[str] = None) -> List[dict]:
        """
        Returns a list of payment methods with UI metadata, tailored to the customer's region.
        In development/sandbox, unconfigured providers can be marked as mock/active.
        """
        methods = [
            {
                "id": PaymentProvider.STRIPE.value,
                "name": "Credit / Debit Card",
                "description": "Visa, Mastercard, American Express, Apple Pay, Google Pay",
                "category": "card",
                "badge": "Instant",
                "icons": ["visa", "mastercard", "amex", "applepay", "googlepay"],
                "is_active": True,
                "currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
            },
            {
                "id": PaymentProvider.PAYPAL.value,
                "name": "PayPal",
                "description": "Pay with your PayPal balance, linked bank, or card in 200+ countries",
                "category": "digital_wallet",
                "badge": "Instant",
                "icons": ["paypal"],
                "is_active": True,
                "currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
            },
            {
                "id": PaymentProvider.NOWPAYMENTS.value,
                "name": "Cryptocurrency",
                "description": "USDT (TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC)",
                "category": "crypto",
                "badge": "No KYC / Zero Bank Friction",
                "icons": ["usdt", "btc", "eth", "ltc"],
                "is_active": True,
                "currencies": ["USD"],
            },
            {
                "id": PaymentProvider.FLUTTERWAVE.value,
                "name": "Flutterwave (Global & Africa)",
                "description": "International cards, African bank accounts, Mobile Money (M-Pesa, MTN, Airtel)",
                "category": "regional",
                "badge": "Global & African Cards/Mobile",
                "icons": ["visa", "mastercard", "mpesa", "mobilemoney"],
                "is_active": True,
                "currencies": ["USD", "NGN", "KES", "GHS", "ZAR"],
            },
            {
                "id": PaymentProvider.PAYSTACK.value,
                "name": "Paystack",
                "description": "Cards, Direct Bank Transfer, USSD, Apple Pay (Nigeria, Ghana, Kenya, South Africa)",
                "category": "regional",
                "badge": "Fast Bank / Card",
                "icons": ["visa", "mastercard", "bank"],
                "is_active": True,
                "currencies": ["NGN", "USD", "GHS", "ZAR", "KES"],
            },
            {
                "id": PaymentProvider.BANK_TRANSFER.value,
                "name": "Direct Wire / Bank Transfer",
                "description": "International SWIFT wire or domestic transfer with unique reference memo",
                "category": "bank_wire",
                "badge": "High Limits / No Card Fees",
                "icons": ["bank"],
                "is_active": True,
                "currencies": ["USD"],
            },
        ]
        return methods


payment_factory = PaymentProviderFactory()
