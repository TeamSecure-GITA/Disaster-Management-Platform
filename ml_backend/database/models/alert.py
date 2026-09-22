"""
Alert SQLAlchemy model representing early warnings, public safety broadcasts, and emergency notifications.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from ml_backend.database.models.user import User


class AlertType(str, enum.Enum):
    """Disaster and emergency alert categories."""

    FLOOD = "flood"
    LANDSLIDE = "landslide"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    WILDFIRE = "wildfire"
    TSUNAMI = "tsunami"
    STORM = "storm"
    HEATWAVE = "heatwave"
    OTHER = "other"


class AlertSeverity(str, enum.Enum):
    """Alert threat and urgency classification."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, enum.Enum):
    """Lifecycle status of public safety alert."""

    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    RESOLVED = "resolved"


class Alert(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Emergency alert and public warning broadcast record."""

    __tablename__ = "alerts"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    type: Mapped[AlertType] = mapped_column(
        Enum(AlertType, native_enum=False, length=30),
        nullable=False,
        index=True,
    )
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, native_enum=False, length=20),
        default=AlertSeverity.MEDIUM,
        nullable=False,
        index=True,
    )
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, native_enum=False, length=20),
        default=AlertStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    # Geo broadcast targeting
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    radius_km: Mapped[float] = mapped_column(Float, default=25.0, nullable=False)
    affected_districts: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    affected_state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # Multi-channel dissemination
    channels: Mapped[List[str]] = mapped_column(
        JSONType,
        default=lambda: ["push", "sms"],
        nullable=False,
    )
    broadcast_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    acknowledgements_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Attribution & lifespan
    issued_by_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    # Relationships
    issued_by: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[issued_by_id],
    )

    __table_args__ = (
        Index("ix_alerts_status_severity", "status", "severity"),
        Index("ix_alerts_lat_lon", "latitude", "longitude"),
    )
