"""
Sensor and SensorReading SQLAlchemy models for telemetry, IoT stations, and environmental monitoring.
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ml_backend.database.models.base import Base, JSONType, SoftDeleteMixin, TimestampMixin, UUIDMixin


class SensorType(str, enum.Enum):
    """Types of IoT and remote sensing monitoring devices."""

    WATER_LEVEL = "water_level"
    RAINFALL = "rainfall"
    SOIL_MOISTURE = "soil_moisture"
    SEISMIC = "seismic"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    SMOKE = "smoke"
    AIR_QUALITY = "air_quality"
    PRESSURE = "pressure"
    DISPLACEMENT = "displacement"
    OTHER = "other"


class SensorStatus(str, enum.Enum):
    """Operational status of a sensor device."""

    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    ERROR = "error"


class ReadingAlertLevel(str, enum.Enum):
    """Alarm condition derived from sensor reading."""

    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class Sensor(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Environmental sensor or telemetry station device."""

    __tablename__ = "sensors"

    device_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[SensorType] = mapped_column(
        Enum(SensorType, native_enum=False, length=30),
        nullable=False,
        index=True,
    )

    # Coordinates & location
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    station_code: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)
    basin_or_region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    # Operating parameters
    status: Mapped[SensorStatus] = mapped_column(
        Enum(SensorStatus, native_enum=False, length=20),
        default=SensorStatus.ONLINE,
        nullable=False,
        index=True,
    )
    unit: Mapped[str] = mapped_column(String(30), default="", nullable=False)
    warning_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    critical_threshold: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Cached latest telemetry
    last_reading_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    last_reading_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    battery_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Hardware & manufacturer metadata
    device_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONType, default=dict, nullable=False)

    # Relationship to historical readings
    readings: Mapped[List[SensorReading]] = relationship(
        "SensorReading",
        back_populates="sensor",
        cascade="all, delete-orphan",
        order_by="desc(SensorReading.recorded_at)",
    )

    __table_args__ = (
        Index("ix_sensors_type_status", "type", "status"),
        Index("ix_sensors_lat_lon", "latitude", "longitude"),
    )


class SensorReading(Base, UUIDMixin, TimestampMixin):
    """Individual telemetry reading / time-series data point recorded by a sensor."""

    __tablename__ = "sensor_readings"

    sensor_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sensors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    raw_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    alert_level: Mapped[ReadingAlertLevel] = mapped_column(
        Enum(ReadingAlertLevel, native_enum=False, length=20),
        default=ReadingAlertLevel.NORMAL,
        nullable=False,
        index=True,
    )
    battery_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    signal_strength_rssi: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    sensor: Mapped[Sensor] = relationship(
        "Sensor",
        back_populates="readings",
    )

    __table_args__ = (
        Index("ix_readings_sensor_recorded", "sensor_id", "recorded_at"),
    )
