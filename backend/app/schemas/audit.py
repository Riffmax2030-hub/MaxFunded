"""
Phase 12: Pydantic Schemas for Audit Logs & System Health Diagnostics.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    actor_email: Optional[str] = None
    action: str
    target_type: str
    target_id: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogResponse]


class SystemHealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    database: str = "connected"
    timestamp: datetime
    metrics: Dict[str, Any] = Field(default_factory=dict)
