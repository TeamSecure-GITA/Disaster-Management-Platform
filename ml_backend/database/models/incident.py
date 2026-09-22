"""
Incident SQLAlchemy model representing disaster events, ground reports, and field hazard observations.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from ml_backend.database.models.responder import Responder
    from ml_backend.database.models.user import User


class IncidentType(str, enum.Enum):
    """Types of disaster incidents."""

    LANDSLIDE_CRACK = "landslide_crack"
    BLOCKED_ROAD = "blocked_road"
    SLOPE_MOVEMENT = "slope_movement"
    SOIL_EROSION = "soil_erosion"
    FLOODING = "flooding"
    FLOOD = "flooding"
    BRIDGE_DAMAGE = "bridge_damage"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    WILDFIRE = "wildfire"
    TSUNAMI = "tsunami"
    OTHER = "other"


class IncidentSeverity(str, enum.Enum):
    """Incident severity classification."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, enum.Enum):
    """Workflow statuses for an incident."""

    PENDING = "pending"
    VERIFIED = "verified"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Incident(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Incident report model."""

    __tablename__ = "incidents"

    # Reporter reference
    reported_by_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Classification
    incident_type: Mapped[IncidentType] = mapped_column(
        Enum(IncidentType, native_enum=False, length=30),
        nullable=False,
        index=True,
    )
    severity: Mapped[IncidentSeverity] = mapped_column(
        Enum(IncidentSeverity, native_enum=False, length=20),
        default=IncidentSeverity.MEDIUM,
        nullable=False,
        index=True,
    )
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Geolocation (WGS-84 decimal coordinates)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)

    # Spatial context & terrain parameters
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    slope_angle: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Field observations
    witness_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_road_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    affected_villages: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, index=True)

    # Media attachments (URLs, captions, metadata)
    media: Mapped[List[Dict[str, Any]]] = mapped_column(JSONType, default=list, nullable=False)

    # Workflow & verification
    status: Mapped[IncidentStatus] = mapped_column(
        Enum(IncidentStatus, native_enum=False, length=20),
        default=IncidentStatus.PENDING,
        nullable=False,
        index=True,
    )
    verified_by_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    assigned_to_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Offline synchronization metadata
    offline_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, unique=True, index=True)
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    reported_by: Mapped[User] = relationship(
        "User",
        foreign_keys=[reported_by_id],
        back_populates="reported_incidents",
    )
    verified_by: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[verified_by_id],
        back_populates="verified_incidents",
    )
    assigned_to: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        back_populates="assigned_incidents",
    )
    assigned_responders: Mapped[List[Responder]] = relationship(
        "Responder",
        back_populates="active_incident",
    )

    __table_args__ = (
        Index("ix_incidents_lat_lon", "latitude", "longitude"),
        Index("ix_incidents_status_severity", "status", "severity"),
        Index("ix_incidents_state_district", "state", "district"),
    )
