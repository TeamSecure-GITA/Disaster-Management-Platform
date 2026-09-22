"""
Responder SQLAlchemy model representing emergency personnel, NDRF/SDRF rescue teams, and field volunteers.
"""

from __future__ import annotations

import enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from ml_backend.database.models.incident import Incident
    from ml_backend.database.models.user import User


class ResponderStatus(str, enum.Enum):
    """Operational deployment status of first responder."""

    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    ON_SCENE = "on_scene"
    RESTING = "resting"
    OFF_DUTY = "off_duty"


class Responder(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Emergency first responder and rescue specialist."""

    __tablename__ = "responders"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    badge_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    organization: Mapped[str] = mapped_column(String(100), default="SDRF", nullable=False, index=True)
    team_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    designation: Mapped[str] = mapped_column(String(100), default="Field Specialist", nullable=False)

    # Operational status & deployment
    availability_status: Mapped[ResponderStatus] = mapped_column(
        Enum(ResponderStatus, native_enum=False, length=20),
        default=ResponderStatus.AVAILABLE,
        nullable=False,
        index=True,
    )
    active_incident_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Real-time or last known location
    latitude: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, index=True)
    service_radius_km: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)

    # Skills & readiness
    specializations: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    certifications: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    has_emergency_training: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    vehicle_identifier: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped[User] = relationship(
        "User",
        back_populates="responder_profile",
    )
    active_incident: Mapped[Optional[Incident]] = relationship(
        "Incident",
        back_populates="assigned_responders",
    )

    __table_args__ = (
        Index("ix_responders_org_status", "organization", "availability_status"),
        Index("ix_responders_lat_lon", "latitude", "longitude"),
    )
