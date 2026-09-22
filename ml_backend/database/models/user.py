"""
User SQLAlchemy model representing citizens, volunteers, responders, and administrators.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from ml_backend.database.models.audit import AuditLog
    from ml_backend.database.models.incident import Incident
    from ml_backend.database.models.responder import Responder


class UserRole(str, enum.Enum):
    """User authorization roles."""

    USER = "user"
    VOLUNTEER = "volunteer"
    RESPONDER = "responder"
    OPERATOR = "operator"
    ADMIN = "admin"


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Platform user model."""

    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, length=20),
        default=UserRole.USER,
        nullable=False,
        index=True,
    )
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Location & address details
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Status & verification flags
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    reported_incidents: Mapped[List[Incident]] = relationship(
        "Incident",
        foreign_keys="Incident.reported_by_id",
        back_populates="reported_by",
        cascade="all, delete-orphan",
    )
    verified_incidents: Mapped[List[Incident]] = relationship(
        "Incident",
        foreign_keys="Incident.verified_by_id",
        back_populates="verified_by",
    )
    assigned_incidents: Mapped[List[Incident]] = relationship(
        "Incident",
        foreign_keys="Incident.assigned_to_id",
        back_populates="assigned_to",
    )
    responder_profile: Mapped[Optional[Responder]] = relationship(
        "Responder",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[List[AuditLog]] = relationship(
        "AuditLog",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_users_role_state", "role", "state"),
    )
