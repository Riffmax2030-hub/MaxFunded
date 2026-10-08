"""
Automated Account Provisioning Service.

This module is a thin adapter that delegates to MT5TradingService so the
payment-confirmation flow and the bridge are always in sync. Any provisioning
logic changes should happen in mt5_service.py — not here.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge, ChallengePurchase
from app.services.mt5_service import mt5_service


class ProvisioningService:
    """
    Backward-compatible provisioning adapter.

    payment_processor.py and the payment webhook handlers still call
    `provisioning_service.provision_account(...)` — this class keeps that
    interface alive while routing through the unified MT5TradingService.
    """

    @staticmethod
    async def provision_account(
        purchase: ChallengePurchase,
        challenge: Challenge,
        db: AsyncSession,
        server_name: str = "MaxFunded-LiveSim",
    ) -> ChallengePurchase:
        """
        Provisions an MT5 account for a confirmed challenge purchase.
        Delegates entirely to MT5TradingService.provision_mt5_account().
        Callers are responsible for committing the session.
        """
        return await mt5_service.provision_mt5_account(
            purchase=purchase,
            challenge=challenge,
            db=db,
            server_name=server_name,
        )


provisioning_service = ProvisioningService()
