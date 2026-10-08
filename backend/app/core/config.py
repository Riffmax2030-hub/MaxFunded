import os
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE_PATH = str(_BACKEND_DIR / ".env")


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "RiffMax Funding"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "riffmax-secret-key-production-change-32-chars-long!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./riffmax.db"
    DATABASE_URL_SYNC: str = "sqlite:///./riffmax.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Compliance & Currencies
    DEFAULT_CURRENCY: str = "USD"
    SUPPORTED_COUNTRIES: Union[str, List[str]] = "US,GB,CA,DE,FR,NG,ZA,AE,SG,AU"
    RESTRICTED_COUNTRIES: Union[str, List[str]] = "IR,KP,SY,CU,RU,BY"
    KYC_REQUIRED_COUNTRIES: Union[str, List[str]] = "US,NG,GB"

    # URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # PayPal
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYPAL_MODE: str = "sandbox"  # sandbox or live
    PAYPAL_WEBHOOK_ID: str = ""

    # Flutterwave
    FLUTTERWAVE_PUBLIC_KEY: str = ""
    FLUTTERWAVE_SECRET_KEY: str = ""
    FLUTTERWAVE_ENCRYPTION_KEY: str = ""
    FLUTTERWAVE_SECRET_HASH: str = ""

    # Paystack
    PAYSTACK_SECRET_KEY: str = ""
    PAYSTACK_PUBLIC_KEY: str = ""

    # NowPayments (Crypto)
    NOWPAYMENTS_API_KEY: str = ""
    NOWPAYMENTS_IPN_SECRET: str = ""
    NOWPAYMENTS_SANDBOX: bool = True

    # Bank Transfer (Wire / Local)
    BANK_TRANSFER_ENABLED: bool = True
    BANK_NAME: str = "Standard Chartered / Zenith Bank"
    BANK_ACCOUNT_NAME: str = "Riffmax Technologies Ltd"
    BANK_ACCOUNT_NUMBER: str = "1018942351"
    BANK_SWIFT_BIC: str = "SCBLNGLA"
    BANK_IBAN: str = ""
    BANK_ROUTING: str = ""
    BANK_CURRENCY: str = "USD"
    BANK_INSTRUCTIONS: str = "Include your unique reference code in the transfer memo/description."

    # Transactional Email (SMTP / Brevo / Resend / Google Workspace)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "support@maxfunded.com"
    SMTP_FROM_NAME: str = "MaxFunded Prop Firm"
    SMTP_TLS: bool = True

    # MT5 Live Bridge
    # Challenge/evaluation phase server (Phase 1 & 2 accounts)
    MT5_CHALLENGE_SERVER: str = "MaxFunded-Server1"
    # Funded live trading server (passed traders only)
    MT5_LIVE_SERVER: str = "MaxFunded-Live1"
    MT5_BRIDGE_SECRET: str = "change-me-in-production-32chars"
    # Real MT5 Manager API connection (leave empty to stay in simulation mode)
    MT5_MANAGER_HOST: str = ""
    MT5_MANAGER_PORT: int = 443
    MT5_MANAGER_LOGIN: int = 0
    MT5_MANAGER_PASSWORD: str = ""

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def resolve_database_url(cls, v: str) -> str:
        if isinstance(v, str) and ("riffmax.db" in v and not v.startswith("sqlite+aiosqlite:////")):
            db_path = str((_BACKEND_DIR / "riffmax.db").resolve()).replace("\\", "/")
            return f"sqlite+aiosqlite:///{db_path}"
        return v

    @field_validator("DATABASE_URL_SYNC", mode="before")
    @classmethod
    def resolve_database_url_sync(cls, v: str) -> str:
        if isinstance(v, str) and ("riffmax.db" in v and not v.startswith("sqlite:////")):
            db_path = str((_BACKEND_DIR / "riffmax.db").resolve()).replace("\\", "/")
            return f"sqlite:///{db_path}"
        return v

    model_config = SettingsConfigDict(
        env_file=(_ENV_FILE_PATH, ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    def get_supported_countries(self) -> List[str]:
        if isinstance(self.SUPPORTED_COUNTRIES, list):
            return self.SUPPORTED_COUNTRIES
        return [c.strip().upper() for c in self.SUPPORTED_COUNTRIES.split(",") if c.strip()]

    def get_restricted_countries(self) -> List[str]:
        if isinstance(self.RESTRICTED_COUNTRIES, list):
            return self.RESTRICTED_COUNTRIES
        return [c.strip().upper() for c in self.RESTRICTED_COUNTRIES.split(",") if c.strip()]

    def get_kyc_required_countries(self) -> List[str]:
        if isinstance(self.KYC_REQUIRED_COUNTRIES, list):
            return self.KYC_REQUIRED_COUNTRIES
        return [c.strip().upper() for c in self.KYC_REQUIRED_COUNTRIES.split(",") if c.strip()]


settings = Settings()
