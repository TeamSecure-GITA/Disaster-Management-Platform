"""
AuditLog SQLAlchemy model representing system audit trails, compliance logs, and security tracking.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, JSONType, UUIDMixin, utc_now

if TYPE_CHECKING:
    from ml_backend.database.models.user import User


class AuditAction(str, enum.Enum):
    """Audit action categories."""

    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    VERIFY = "VERIFY"
    ESCALATE = "ESCALATE"
    RESOLVE = "RESOLVE"
    DISPATCH = "DISPATCH"
    BROADCAST_ALERT = "BROADCAST_ALERT"
    ALLOCATE_RESOURCE = "ALLOCATE_RESOURCE"
    LOGIN = "LOGIN"
    LOGIN_FAILED = "LOGIN_FAILED"
    SYSTEM_JOB = "SYSTEM_JOB"


class AuditStatus(str, enum.Enum):
    """Execution status of audited action."""

    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class AuditLog(Base, UUIDMixin):
    """Immutable audit entry for platform operations and security tracking."""

    __tablename__ = "audit_logs"

    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction, native_enum=False, length=30),
        nullable=False,
        index=True,
    )
    entity_type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    entity_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)

    # Change tracking deltas
    old_values: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)
    new_values: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)

    # Client / Request metadata
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[AuditStatus] = mapped_column(
        Enum(AuditStatus, native_enum=False, length=20),
        default=AuditStatus.SUCCESS,
        nullable=False,
        index=True,
    )
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )

    # Relationships
    user: Mapped[Optional[User]] = relationship(
        "User",
        back_populates="audit_logs",
    )

    __table_args__ = (
        Index("ix_audit_entity", "entity_type", "entity_id"),
        Index("ix_audit_action_status", "action", "status"),
        Index("ix_audit_timestamp", "timestamp"),
    )
