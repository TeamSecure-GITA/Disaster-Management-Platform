"""
Shelter SQLAlchemy model representing relief camps, evacuation centers, and emergency safe havens.
"""

from __future__ import annotations

import enum
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, Enum, Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin


class ShelterStatus(str, enum.Enum):
    """Operational status of an evacuation shelter."""

    ACTIVE = "active"
    FULL = "full"
    INACTIVE = "inactive"
    EVACUATED = "evacuated"


class Shelter(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Emergency shelter or relief camp facility."""

    __tablename__ = "shelters"

    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Geo coordinates
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)

    # Capacity & occupancy
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Contact & operational details
    contact_person: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    contact_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[ShelterStatus] = mapped_column(
        Enum(ShelterStatus, native_enum=False, length=20),
        default=ShelterStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    # Facilities and inventory breakdown
    facilities: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    supplies_status: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)

    # Accessibility attributes
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    pet_friendly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    medical_facility_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    @property
    def available_capacity(self) -> int:
        """Calculate remaining beds/spaces in shelter."""
        return max(0, self.capacity - self.current_occupancy)

    @property
    def occupancy_rate(self) -> float:
        """Occupancy percentage from 0.0 to 1.0+."""
        if self.capacity <= 0:
            return 0.0
        return self.current_occupancy / float(self.capacity)

    __table_args__ = (
        Index("ix_shelters_state_district", "state", "district"),
        Index("ix_shelters_lat_lon", "latitude", "longitude"),
    )
