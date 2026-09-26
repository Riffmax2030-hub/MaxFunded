from sqlalchemy import Column, String, Text, ForeignKey
from app.models.base import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    actor_id = Column(String(36), nullable=False, index=True)
    actor_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "ADMIN_UPDATED_CHALLENGE_RULES"
    target_type = Column(String(50), nullable=False)  # e.g., "CHALLENGE", "USER", "PAYOUT"
    target_id = Column(String(36), nullable=False, index=True)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    reason = Column(Text, nullable=True)
