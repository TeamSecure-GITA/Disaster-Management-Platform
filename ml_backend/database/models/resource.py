"""
Resource SQLAlchemy model representing emergency inventory, relief supplies, vehicles, and equipment.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin


class ResourceType(str, enum.Enum):
    """Categories of disaster relief and response resources."""

    FOOD = "food"
    WATER = "water"
    MEDICINE = "medicine"
    CLOTHING = "clothing"
    EQUIPMENT = "equipment"
    VEHICLE = "vehicle"
    GENERATOR = "generator"
    SHELTER_KIT = "shelter_kit"
    MEDICAL = "medical"
    COMMUNICATION = "communication"
    PERSONNEL = "personnel"
    OTHER = "other"


class ResourceStatus(str, enum.Enum):
    """Availability status of resource stockpiles."""

    AVAILABLE = "available"
    RESERVED = "reserved"
    IN_TRANSIT = "in_transit"
    DEPLETED = "depleted"


class Resource(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Emergency resource inventory item or logistics asset."""

    __tablename__ = "resources"

    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    type: Mapped[ResourceType] = mapped_column(
        Enum(ResourceType, native_enum=False, length=30),
        nullable=False,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Quantity and measurement units
    quantity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    unit: Mapped[str] = mapped_column(String(40), default="units", nullable=False)
    min_threshold: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)

    # Location / depot / warehouse
    depot_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # Status & allocation
    status: Mapped[ResourceStatus] = mapped_column(
        Enum(ResourceStatus, native_enum=False, length=20),
        default=ResourceStatus.AVAILABLE,
        nullable=False,
        index=True,
    )
    allocated_incident_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("incidents.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    allocated_shelter_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("shelters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Perishability & supplier details
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    supplier_info: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)

    @property
    def is_low_stock(self) -> bool:
        """Check if inventory is below safety minimum."""
        return self.quantity <= self.min_threshold

    __table_args__ = (
        Index("ix_resources_type_status", "type", "status"),
        Index("ix_resources_state_district", "state", "district"),
    )
