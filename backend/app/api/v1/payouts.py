"""
Trader Profit Payouts & Withdrawal Rails API
============================================
Endpoints for trader profit withdrawals, KYC enforcement, multi-method rails
(Crypto USDT TRC20/ERC20, Bank Wire SWIFT, Local Bank NGN, PayPal), and
Finance Administrator approval queues.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user, RoleName, require_roles
from app.models.user import User
from app.models.payout import PayoutRequest, PayoutStatus
from app.schemas.payout import (
    PayoutEligibilityResponse,
    PayoutRequestCreate,
    PayoutRequestResponse,
    AdminPayoutReviewRequest,
)
from app.services.payout_service import payout_service

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# TRADER ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get(
    "/eligibility/{purchase_id}",
    response_model=PayoutEligibilityResponse,
    summary="Check profit withdrawal eligibility for an account",
)
async def check_payout_eligibility(
    purchase_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluates account balance against starting balance, computes 80/20 profit split,
    verifies KYC approval, and returns detailed eligibility breakdown.
    """
    return await payout_service.check_eligibility(
        purchase_id=purchase_id,
        user=current_user,
        db=db,
    )


@router.post(
    "/request",
    response_model=PayoutRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request a profit share payout",
)
async def request_payout(
    payload: PayoutRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a new profit payout request.
    Strictly requires APPROVED KYC status and positive account profits.
    """
    return await payout_service.request_payout(
        user=current_user,
        payload=payload,
        db=db,
    )


@router.get(
    "/my-payouts",
    response_model=List[PayoutRequestResponse],
    summary="List trader's historical payout requests",
)
async def list_my_payouts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns all payout requests submitted by the current authenticated trader."""
    stmt = (
        select(PayoutRequest)
        .where(PayoutRequest.user_id == current_user.id)
        .order_by(desc(PayoutRequest.requested_at))
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post(
    "/{payout_id}/cancel",
    response_model=PayoutRequestResponse,
    summary="Cancel a pending payout request",
)
async def cancel_my_payout(
    payout_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Allows trader to cancel an unreviewed payout request and unlock funds."""
    return await payout_service.cancel_payout(
        payout_id=payout_id,
        user=current_user,
        db=db,
    )


# ─────────────────────────────────────────────────────────────
# FINANCE ADMIN ENDPOINTS
# ─────────────────────────────────────────────────────────────

@router.get(
    "/admin/queue",
    response_model=List[PayoutRequestResponse],
    summary="List all payout requests in operations queue",
)
async def list_admin_payout_queue(
    status_filter: Optional[PayoutStatus] = Query(None, description="Filter by status (REQUESTED, APPROVED, etc.)"),
    limit: int = Query(50, ge=1, le=200),
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Finance Admin only: Retrieves the global payout review queue."""
    stmt = select(PayoutRequest).order_by(desc(PayoutRequest.requested_at)).limit(limit)
    if status_filter:
        stmt = stmt.where(PayoutRequest.status == status_filter)

    res = await db.execute(stmt)
    return res.scalars().all()


@router.get(
    "/admin/{payout_id}",
    response_model=PayoutRequestResponse,
    summary="Get detailed payout request dossier",
)
async def get_admin_payout_detail(
    payout_id: str,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Finance Admin only: Retrieves a specific payout request."""
    stmt = select(PayoutRequest).where(PayoutRequest.id == payout_id)
    res = await db.execute(stmt)
    payout = res.scalar_one_or_none()

    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")

    return payout


@router.post(
    "/admin/{payout_id}/review",
    response_model=PayoutRequestResponse,
    summary="Review, approve, mark paid, or reject payout",
)
async def review_payout_request(
    payout_id: str,
    payload: AdminPayoutReviewRequest,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Finance Admin only: Progresses payout status (UNDER_REVIEW, APPROVED, PROCESSING, PAID, REJECTED).
    If REJECTED, automatically restores deducted profit back to the trading account.
    """
    return await payout_service.review_payout(
        payout_id=payout_id,
        reviewer=current_admin,
        payload=payload,
        db=db,
    )
