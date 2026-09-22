"""
Prediction SQLAlchemy model representing AI/ML hazard probability forecasts and impact estimates.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, Enum, Float, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ml_backend.database.models.base import Base, JSONType, TimestampMixin, UUIDMixin


class DisasterType(str, enum.Enum):
    """Types of hazards forecast by ML models."""

    FLOOD = "flood"
    LANDSLIDE = "landslide"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    WILDFIRE = "wildfire"
    HEATWAVE = "heatwave"
    TSUNAMI = "tsunami"
    OTHER = "other"


class RiskLevel(str, enum.Enum):
    """Calibrated risk level classification."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Prediction(Base, UUIDMixin, TimestampMixin):
    """AI/ML risk and hazard prediction output."""

    __tablename__ = "predictions"

    disaster_type: Mapped[DisasterType] = mapped_column(
        Enum(DisasterType, native_enum=False, length=30),
        nullable=False,
        index=True,
    )
    model_name: Mapped[str] = mapped_column(String(100), default="ensemble_hazard_v1", nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)

    # Spatial target
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # Probabilistic prediction scores
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, native_enum=False, length=20),
        nullable=False,
        index=True,
    )
    probability: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    severity_index: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Time horizons
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    # Impact estimates & explanation features
    affected_population_estimate: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    features_used: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)
    spatial_extent_geojson: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)
    mitigation_recommendations: Mapped[List[str]] = mapped_column(JSONType, default=list, nullable=False)
    summary_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_predictions_type_risk", "disaster_type", "risk_level"),
        Index("ix_predictions_lat_lon", "latitude", "longitude"),
        Index("ix_predictions_state_district", "state", "district"),
    )
