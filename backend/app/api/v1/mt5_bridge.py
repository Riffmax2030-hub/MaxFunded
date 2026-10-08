"""
MT5 Live Bridge API — FastAPI endpoints for MetaTrader 5 integration.

Security model:
  - Trade/equity endpoints: shared-secret header (X-MT5-Bridge-Secret).
    The MT5 Expert Advisor or Manager API sends this header on every request.
    Prevents random internet traffic from injecting fake trades.
  - Provision endpoint: RBAC SUPER_ADMIN JWT (admin UI triggered).

All state mutation (DB writes, risk engine, copy engine) is handled inside
mt5_service — these endpoints are thin HTTP adaptors only.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.rbac import get_current_user, RoleName, require_roles
from app.models.challenge import Challenge, ChallengePurchase
from app.schemas.trading import (
    MT5TradeEventSchema,
    MT5EquityTickSchema,
    MT5BridgeResultSchema,
)
from app.services.mt5_service import mt5_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Dependency helpers
# ---------------------------------------------------------------------------

def verify_bridge_secret(
    x_mt5_bridge_secret: Optional[str] = Header(default=None, alias="X-MT5-Bridge-Secret"),
) -> None:
    """
    Validates the shared secret that the MT5 EA / Manager API attaches.
    Raises HTTP 403 if missing or wrong.
    """
    expected = getattr(settings, "MT5_BRIDGE_SECRET", "change-me-in-production-32chars")
    if not x_mt5_bridge_secret or x_mt5_bridge_secret != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing MT5 bridge secret.",
        )


# Reusable admin dependency — SUPER_ADMIN or TRADING_ADMIN may manage accounts
require_admin = require_roles([RoleName.SUPER_ADMIN, RoleName.TRADING_ADMIN])


# ---------------------------------------------------------------------------
# POST /trading/mt5/bridge/trade
# ---------------------------------------------------------------------------

@router.post(
    "/mt5/bridge/trade",
    response_model=MT5BridgeResultSchema,
    summary="Ingest MT5 trade event",
    description=(
        "Receives a deal/order event from the MT5 Expert Advisor or Manager API. "
        "Writes the trade, updates balances, runs the risk engine, "
        "and returns whether trading should continue or be locked."
    ),
    dependencies=[Depends(verify_bridge_secret)],
)
async def mt5_ingest_trade(
    event: MT5TradeEventSchema,
    db: AsyncSession = Depends(get_db),
) -> MT5BridgeResultSchema:
    try:
        result = await mt5_service.process_trade_event(event=event, db=db)
        return result
    except ValueError as exc:
        logger.warning("MT5 bridge trade error: %s", exc)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected MT5 bridge trade error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal bridge error. Check server logs.",
        )


# ---------------------------------------------------------------------------
# POST /trading/mt5/bridge/equity
# ---------------------------------------------------------------------------

@router.post(
    "/mt5/bridge/equity",
    response_model=MT5BridgeResultSchema,
    summary="Ingest MT5 floating equity tick",
    description=(
        "High-frequency endpoint — receives live equity ticks from the MT5 EA. "
        "Runs real-time drawdown checks and immediately locks trading if a limit "
        "is breached. EA should call this every 1–5 seconds while a position is open."
    ),
    dependencies=[Depends(verify_bridge_secret)],
)
async def mt5_ingest_equity_tick(
    tick: MT5EquityTickSchema,
    db: AsyncSession = Depends(get_db),
) -> MT5BridgeResultSchema:
    try:
        result = await mt5_service.process_equity_tick(tick=tick, db=db)
        return result
    except ValueError as exc:
        logger.warning("MT5 bridge equity error: %s", exc)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected MT5 bridge equity error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal bridge error. Check server logs.",
        )


# ---------------------------------------------------------------------------
# POST /trading/mt5/bridge/provision/{purchase_id}  (ADMIN ONLY)
# ---------------------------------------------------------------------------

@router.post(
    "/mt5/bridge/provision/{purchase_id}",
    response_model=MT5BridgeResultSchema,
    summary="Admin: Provision MT5 account for a challenge purchase",
    description=(
        "Manually triggers MT5 account provisioning for a specific challenge purchase. "
        "Useful if automated provisioning failed after payment, or if re-provisioning "
        "is needed. SUPER_ADMIN / ADMIN only."
    ),
)
async def mt5_provision_account(
    purchase_id: int = Path(..., description="ID of the ChallengePurchase to provision"),
    db: AsyncSession = Depends(get_db),
    admin = Depends(require_admin),
) -> MT5BridgeResultSchema:
    # Load the purchase with its parent challenge
    stmt = (
        select(ChallengePurchase)
        .options(selectinload(ChallengePurchase.challenge))
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ChallengePurchase {purchase_id} not found.",
        )

    challenge = purchase.challenge
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Purchase {purchase_id} has no associated challenge.",
        )

    try:
        updated_purchase = await mt5_service.provision_mt5_account(
            purchase=purchase,
            challenge=challenge,
            db=db,
            is_funded=False,  # Admin provisioning = challenge phase → MaxFunded-Server1
        )
        await db.commit()
        await db.refresh(updated_purchase)

        logger.info(
            "Admin %s manually provisioned MT5 account for purchase %s → login %s on %s",
            admin.email,
            purchase_id,
            updated_purchase.mt5_login,
            updated_purchase.mt5_server,
        )

        return MT5BridgeResultSchema(
            success=True,
            purchase_id=updated_purchase.id,
            mt5_login=updated_purchase.mt5_login,
            status=updated_purchase.status,
            is_breached=False,
            is_passed=False,
            breach_message=None,
            daily_loss_remaining_usd=None,
            max_drawdown_remaining_usd=None,
            trading_locked=False,
        )
    except Exception as exc:
        await db.rollback()
        logger.exception("Provision error for purchase %s: %s", purchase_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Provisioning failed: {exc}",
        )


# ---------------------------------------------------------------------------
# POST /trading/mt5/bridge/migrate-to-live/{purchase_id}  (ADMIN ONLY)
# ---------------------------------------------------------------------------

@router.post(
    "/mt5/bridge/migrate-to-live/{purchase_id}",
    response_model=MT5BridgeResultSchema,
    summary="Admin: Migrate a passed trader to MaxFunded-Live1",
    description=(
        "When a trader passes their evaluation, call this endpoint to re-provision "
        "their account on MaxFunded-Live1 (the funded server) with fresh credentials. "
        "The old MaxFunded-Server1 account is deactivated. SUPER_ADMIN / ADMIN only."
    ),
)
async def mt5_migrate_to_live(
    purchase_id: int = Path(..., description="ID of the passed ChallengePurchase"),
    db: AsyncSession = Depends(get_db),
    admin = Depends(require_admin),
) -> MT5BridgeResultSchema:
    stmt = (
        select(ChallengePurchase)
        .options(selectinload(ChallengePurchase.challenge))
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ChallengePurchase {purchase_id} not found.",
        )

    challenge = purchase.challenge
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Purchase {purchase_id} has no associated challenge.",
        )

    old_login = purchase.mt5_login
    old_server = purchase.mt5_server

    try:
        # Re-provision on live server — generates new login + password on MaxFunded-Live1
        updated_purchase = await mt5_service.provision_mt5_account(
            purchase=purchase,
            challenge=challenge,
            db=db,
            is_funded=True,  # → MaxFunded-Live1
        )
        await db.commit()
        await db.refresh(updated_purchase)

        # Auto-issue official FUNDED_TRADER certificate
        try:
            from app.services.certificate_service import certificate_service
            from app.models.certificate import CertificateType
            await certificate_service.get_or_issue_certificate(
                db=db,
                purchase_id=updated_purchase.id,
                cert_type=CertificateType.FUNDED_TRADER,
            )
            await db.commit()
        except Exception as cert_err:
            logger.warning("Could not issue FUNDED_TRADER certificate on live migration: %s", cert_err)

        logger.info(
            "Admin %s migrated purchase %s from %s(%s) → %s(%s)",
            admin.email,
            purchase_id,
            old_server,
            old_login,
            updated_purchase.mt5_server,
            updated_purchase.mt5_login,
        )

        return MT5BridgeResultSchema(
            success=True,
            purchase_id=updated_purchase.id,
            mt5_login=updated_purchase.mt5_login,
            status=updated_purchase.status,
            is_breached=False,
            is_passed=True,
            breach_message=None,
            daily_loss_remaining_usd=None,
            max_drawdown_remaining_usd=None,
            trading_locked=False,
        )
    except Exception as exc:
        await db.rollback()
        logger.exception("Live migration error for purchase %s: %s", purchase_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Live migration failed: {exc}",
        )


# ---------------------------------------------------------------------------
# GET /trading/mt5/bridge/account/{mt5_login}  (ADMIN ONLY)
# ---------------------------------------------------------------------------

@router.get(
    "/mt5/bridge/account/{mt5_login}",
    summary="Admin: Get live account status by MT5 login",
    description=(
        "Returns the current challenge purchase state for a given MT5 login. "
        "Useful for support teams to quickly check an account's risk metrics "
        "without navigating the full admin panel."
    ),
)
async def mt5_get_account_status(
    mt5_login: str = Path(..., description="MT5 account login number"),
    db: AsyncSession = Depends(get_db),
    admin = Depends(require_admin),
) -> dict:
    stmt = (
        select(ChallengePurchase)
        .options(
            selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
        )
        .where(ChallengePurchase.mt5_login == mt5_login)
        .order_by(ChallengePurchase.created_at.desc())
    )
    res = await db.execute(stmt)
    purchase = res.scalars().first()

    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No account found with MT5 login: {mt5_login}",
        )

    challenge = purchase.challenge
    return {
        "purchase_id": purchase.id,
        "user_id": purchase.user_id,
        "mt5_login": purchase.mt5_login,
        "mt5_server": purchase.mt5_server,
        "status": purchase.status,
        "current_balance": float(purchase.current_balance or 0),
        "current_equity": float(purchase.current_equity or 0),
        "high_water_mark": float(purchase.high_water_mark or 0),
        "daily_starting_equity": float(purchase.daily_starting_equity or 0),
        "trading_days_count": purchase.trading_days_count or 0,
        "challenge_name": challenge.name if challenge else None,
        "challenge_starting_balance": float(challenge.starting_balance) if challenge else None,
        "breached_reason": purchase.breached_reason,
        "breached_at": purchase.breached_at.isoformat() if purchase.breached_at else None,
        "passed_at": purchase.passed_at.isoformat() if purchase.passed_at else None,
    }
