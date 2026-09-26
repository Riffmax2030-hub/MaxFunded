"""
Phase 12: System Health Diagnostics & Immutable Audit Logs API.
"""
from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_user, require_roles, RoleName
from app.models.user import User
from app.schemas.audit import (
    AuditLogListResponse,
    SystemHealthResponse,
)
from app.services.audit_service import AuditService

router = APIRouter(tags=["System Health & Audit Logs"])
audit_service = AuditService()


@router.get(
    "/health",
    response_model=SystemHealthResponse,
    summary="Platform health check and live operational metrics",
)
async def system_health_check(
    db: AsyncSession = Depends(get_db),
):
    """
    Public health check endpoint.
    Verifies database connectivity and returns live platform diagnostic pulse metrics.
    """
    return await audit_service.get_system_health(db)


@router.get(
    "/admin/audit-logs",
    response_model=AuditLogListResponse,
    summary="Admin query immutable audit logs trail",
)
async def query_admin_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action name"),
    target_type: Optional[str] = Query(None, description="Filter by target entity type"),
    actor_id: Optional[str] = Query(None, description="Filter by actor ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.COMPLIANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Query immutable audit logs tracking administrative operations across the platform."""
    total, items = await audit_service.query_logs(
        db=db,
        action=action,
        target_type=target_type,
        actor_id=actor_id,
        limit=limit,
        offset=offset,
    )
    return AuditLogListResponse(total=total, items=items)
