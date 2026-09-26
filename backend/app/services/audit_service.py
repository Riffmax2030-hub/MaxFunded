"""
Phase 12: Audit Trail Logging & System Diagnostics Service.
Provides immutable accountability for all administrative mutations and live system health metrics.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, desc, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog
from app.models.user import User
from app.models.challenge import Challenge, ChallengePurchase
from app.models.payout import PayoutRequest, PayoutStatus
from app.schemas.audit import SystemHealthResponse


class AuditService:
    async def log_action(
        self,
        db: AsyncSession,
        actor_id: str,
        actor_email: Optional[str],
        action: str,
        target_type: str,
        target_id: str,
        previous_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        ip_address: Optional[str] = None,
        reason: Optional[str] = None,
    ) -> AuditLog:
        """Records an immutable audit trail entry."""
        prev_str = json.dumps(previous_value) if isinstance(previous_value, (dict, list)) else (str(previous_value) if previous_value is not None else None)
        new_str = json.dumps(new_value) if isinstance(new_value, (dict, list)) else (str(new_value) if new_value is not None else None)

        entry = AuditLog(
            actor_id=actor_id,
            actor_email=actor_email,
            action=action,
            target_type=target_type,
            target_id=str(target_id),
            previous_value=prev_str,
            new_value=new_str,
            ip_address=ip_address,
            reason=reason,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def query_logs(
        self,
        db: AsyncSession,
        action: Optional[str] = None,
        target_type: Optional[str] = None,
        actor_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[int, List[AuditLog]]:
        """Queries audit log records with optional filtering and pagination."""
        query = select(AuditLog)
        count_query = select(func.count(AuditLog.id))

        if action:
            query = query.where(AuditLog.action == action)
            count_query = count_query.where(AuditLog.action == action)
        if target_type:
            query = query.where(AuditLog.target_type == target_type)
            count_query = count_query.where(AuditLog.target_type == target_type)
        if actor_id:
            query = query.where(AuditLog.actor_id == actor_id)
            count_query = count_query.where(AuditLog.actor_id == actor_id)

        # Count total
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0

        # Fetch page
        query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
        items_res = await db.execute(query)
        items = list(items_res.scalars().all())

        return total, items

    async def get_system_health(self, db: AsyncSession) -> SystemHealthResponse:
        """Executes database connectivity ping and aggregates platform pulse metrics."""
        db_status = "connected"
        try:
            await db.execute(text("SELECT 1"))
        except Exception:
            db_status = "disconnected"

        # Platform metrics
        users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
        active_accounts = (
            await db.execute(
                select(func.count(ChallengePurchase.id)).where(ChallengePurchase.status == "ACTIVE")
            )
        ).scalar() or 0
        pending_payouts = (
            await db.execute(
                select(func.count(PayoutRequest.id)).where(PayoutRequest.status == PayoutStatus.REQUESTED)
            )
        ).scalar() or 0
        challenges_count = (
            await db.execute(select(func.count(Challenge.id)).where(Challenge.is_active == True))
        ).scalar() or 0

        return SystemHealthResponse(
            status="healthy" if db_status == "connected" else "degraded",
            version="1.0.0",
            database=db_status,
            timestamp=datetime.now(timezone.utc),
            metrics={
                "total_registered_traders": users_count,
                "active_trading_accounts": active_accounts,
                "pending_payout_requests": pending_payouts,
                "active_challenge_tiers": challenges_count,
            },
        )
