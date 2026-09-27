"""
WebSocket endpoint for real-time dashboard streaming.

Connection:  wss://api.maxfunded.com/api/v1/ws/dashboard?token=<JWT>
Push cadence: every 5 seconds while connected.
Payload type: { type: "dashboard_update", data: DashboardSummary }

Authentication is via ?token= query parameter because browsers cannot set
Authorization headers on native WebSocket connections.
"""
from __future__ import annotations

import asyncio
import json
import logging
from decimal import Decimal

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import decode_token
from app.models.challenge import ChallengePurchase
from app.models.kyc import KYCVerification
from app.models.user import User
from app.services.dashboard_service import DashboardService

log = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket Real-time"])

_svc = DashboardService()

PUSH_INTERVAL = 5  # seconds between each push


def _decimal_serializer(obj):
    """JSON serializer that handles Decimal and date objects."""
    if isinstance(obj, Decimal):
        return float(obj)
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


async def _authenticate_ws(token: str, db: AsyncSession) -> User | None:
    """Validate JWT from query param and return the User row, or None."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id: str | None = payload.get("sub")
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def _get_active_purchase(db: AsyncSession, user_id: str) -> ChallengePurchase | None:
    active_statuses = [
        "ACTIVE", "WARNING", "TARGET_REACHED", "UNDER_REVIEW",
        "PASSED", "FUNDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID",
    ]
    result = await db.execute(
        select(ChallengePurchase)
        .where(
            ChallengePurchase.user_id == user_id,
            ChallengePurchase.status.in_(active_statuses),
        )
        .order_by(ChallengePurchase.created_at.desc())
    )
    return result.scalars().first()


async def _get_kyc_status(db: AsyncSession, user_id: str) -> str:
    result = await db.execute(
        select(KYCVerification)
        .where(KYCVerification.user_id == user_id)
        .order_by(KYCVerification.created_at.desc())
    )
    kyc = result.scalars().first()
    return kyc.status if kyc else "NOT_SUBMITTED"


@router.websocket("/dashboard")
async def dashboard_ws(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
):
    """
    Real-time dashboard stream.

    Authenticate → stream DashboardSummary every 5s → disconnect on error/close.
    """
    await websocket.accept()

    # ── Authenticate ──────────────────────────────────────────────────────
    async with AsyncSessionLocal() as db:
        user = await _authenticate_ws(token, db)

    if user is None:
        await websocket.send_json({"type": "error", "message": "Unauthorized"})
        await websocket.close(code=4001)
        return

    log.info("WS dashboard connected: user=%s", user.id)

    # ── Stream loop ───────────────────────────────────────────────────────
    try:
        while True:
            async with AsyncSessionLocal() as db:
                purchase = await _get_active_purchase(db, user.id)
                if purchase is None:
                    await websocket.send_json({
                        "type": "no_account",
                        "message": "No active challenge. Purchase a challenge to start.",
                    })
                else:
                    kyc_status = await _get_kyc_status(db, user.id)
                    try:
                        summary = await _svc.get_summary(db, purchase, kyc_status)
                        payload = json.loads(
                            json.dumps(summary.model_dump(), default=_decimal_serializer)
                        )
                        await websocket.send_json({"type": "dashboard_update", "data": payload})
                    except Exception as exc:
                        log.warning("WS dashboard build error for user=%s: %s", user.id, exc)
                        await websocket.send_json({
                            "type": "error",
                            "message": "Dashboard data temporarily unavailable.",
                        })

            await asyncio.sleep(PUSH_INTERVAL)

    except WebSocketDisconnect:
        log.info("WS dashboard disconnected: user=%s", user.id)
    except Exception as exc:
        log.error("WS dashboard fatal error user=%s: %s", user.id, exc)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
