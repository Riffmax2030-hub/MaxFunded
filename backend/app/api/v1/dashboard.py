"""
Dashboard API router — Phase 8.
Provides live metrics, equity curve, and performance breakdown for traders.
"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.challenge import ChallengePurchase
from app.models.kyc import KYCVerification
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, EquityPoint, PerformanceReport
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
_svc = DashboardService()


async def _get_active_purchase(
    db: AsyncSession,
    user: User,
) -> ChallengePurchase:
    """Return the most recently active purchase for the current user."""
    active_statuses = [
        "ACTIVE",
        "WARNING",
        "TARGET_REACHED",
        "UNDER_REVIEW",
        "PASSED",
        "FUNDED",
        "PAYOUT_PENDING",
        "PAYOUT_APPROVED",
        "PAYOUT_PAID",
    ]
    result = await db.execute(
        select(ChallengePurchase)
        .where(
            ChallengePurchase.user_id == user.id,
            ChallengePurchase.status.in_(active_statuses),
        )
        .order_by(ChallengePurchase.created_at.desc())
    )
    purchase = result.scalars().first()
    if purchase is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active challenge account found. Purchase and activate a challenge to view your dashboard.",
        )
    return purchase


async def _get_kyc_status(db: AsyncSession, user: User) -> str:
    """Return the latest KYC status string for a user."""
    result = await db.execute(
        select(KYCVerification)
        .where(KYCVerification.user_id == user.id)
        .order_by(KYCVerification.created_at.desc())
    )
    kyc = result.scalars().first()
    return kyc.status if kyc else "NOT_SUBMITTED"


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return the full dashboard summary card for the trader's active account.
    Includes: balance/equity, drawdown gauges, profit target progress,
    trade stats, rule compliance, KYC status flag, and pending payout flag.
    """
    purchase = await _get_active_purchase(db, current_user)
    kyc_status = await _get_kyc_status(db, current_user)
    return await _svc.get_summary(db, purchase, kyc_status)


@router.get("/equity-curve", response_model=List[EquityPoint])
async def equity_curve(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return daily equity snapshots for the equity curve chart.
    Uses DailySnapshot records. Returns empty list if no history yet.
    """
    purchase = await _get_active_purchase(db, current_user)
    return await _svc.get_equity_curve(db, purchase.id, days=days)


@router.get("/performance", response_model=PerformanceReport)
async def performance_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Return daily P&L breakdown, best/worst day, and trading day count.
    """
    purchase = await _get_active_purchase(db, current_user)
    return await _svc.get_performance(db, purchase.id)
