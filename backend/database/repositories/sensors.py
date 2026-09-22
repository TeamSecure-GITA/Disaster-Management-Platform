"""
Sensor repository providing device lookup, telemetry ingestion, alarm detection, and time-series queries.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import desc, func, or_, select
from sqlalchemy.orm import Session

try:
    from backend.database.models.base import utc_now
    from backend.database.models.sensor import (
        ReadingAlertLevel,
        Sensor,
        SensorReading,
        SensorStatus,
        SensorType,
    )
    from backend.database.repositories.base import BaseRepository
except ImportError:
    from ml_backend.database.models.base import utc_now
    from ml_backend.database.models.sensor import (
        ReadingAlertLevel,
        Sensor,
        SensorReading,
        SensorStatus,
        SensorType,
    )
    from ml_backend.database.repositories.base import BaseRepository


class SensorRepository(BaseRepository[Sensor]):
    """Repository managing IoT sensors, telemetry stations, and stream readings."""

    def __init__(self, session: Session) -> None:
        super().__init__(Sensor, session)

    def get_by_device_id(self, device_id: str) -> Optional[Sensor]:
        """Fetch sensor station by unique hardware device ID."""
        stmt = select(Sensor).where(Sensor.device_id == device_id, Sensor.is_deleted.is_(False))
        return self.session.scalar(stmt)

    def get_by_type(
        self,
        sensor_type: SensorType,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Sensor]:
        """Retrieve all sensors of given observation modality."""
        stmt = (
            select(Sensor)
            .where(Sensor.type == sensor_type, Sensor.is_deleted.is_(False))
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_active_sensors(self, skip: int = 0, limit: int = 100) -> Sequence[Sensor]:
        """Retrieve currently online monitoring devices."""
        stmt = (
            select(Sensor)
            .where(Sensor.status == SensorStatus.ONLINE, Sensor.is_deleted.is_(False))
            .offset(skip)
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_sensors_in_alarm(self) -> List[Sensor]:
        """Retrieve all sensors whose last reading breached warning or critical thresholds."""
        stmt = select(Sensor).where(
            Sensor.status == SensorStatus.ONLINE,
            Sensor.is_deleted.is_(False),
            Sensor.last_reading_value.is_not(None),
            or_(
                (Sensor.critical_threshold.is_not(None))
                & (Sensor.last_reading_value >= Sensor.critical_threshold),
                (Sensor.warning_threshold.is_not(None))
                & (Sensor.last_reading_value >= Sensor.warning_threshold),
            ),
        )
        return list(self.session.scalars(stmt).all())

    def record_reading(
        self,
        sensor_id: str,
        value: float,
        recorded_at: Optional[datetime] = None,
        raw_value: Optional[float] = None,
        battery_percentage: Optional[float] = None,
        signal_strength_rssi: Optional[int] = None,
    ) -> Optional[SensorReading]:
        """
        Record a telemetry reading, evaluate alarm level thresholds, and update sensor state.
        """
        sensor = self.get(sensor_id)
        if not sensor:
            return None

        timestamp = recorded_at or utc_now()

        alert_level = ReadingAlertLevel.NORMAL
        if sensor.critical_threshold is not None and value >= sensor.critical_threshold:
            alert_level = ReadingAlertLevel.CRITICAL
        elif sensor.warning_threshold is not None and value >= sensor.warning_threshold:
            alert_level = ReadingAlertLevel.WARNING

        reading = SensorReading(
            sensor_id=sensor.id,
            value=value,
            raw_value=raw_value if raw_value is not None else value,
            recorded_at=timestamp,
            alert_level=alert_level,
            battery_percentage=battery_percentage,
            signal_strength_rssi=signal_strength_rssi,
        )
        self.session.add(reading)

        sensor.last_reading_value = value
        sensor.last_reading_time = timestamp
        if battery_percentage is not None:
            sensor.battery_level = battery_percentage

        self.session.add(sensor)
        self.session.flush()
        return reading

    def get_latest_readings(
        self,
        sensor_id: str,
        limit: int = 50,
    ) -> Sequence[SensorReading]:
        """Fetch historical time-series readings for a sensor ordered latest first."""
        stmt = (
            select(SensorReading)
            .where(SensorReading.sensor_id == sensor_id)
            .order_by(desc(SensorReading.recorded_at))
            .limit(limit)
        )
        return self.session.scalars(stmt).all()

    def get_readings_time_range(
        self,
        sensor_id: str,
        start_time: datetime,
        end_time: datetime,
    ) -> Sequence[SensorReading]:
        """Fetch readings within specified temporal window."""
        stmt = (
            select(SensorReading)
            .where(
                SensorReading.sensor_id == sensor_id,
                SensorReading.recorded_at.between(start_time, end_time),
            )
            .order_by(SensorReading.recorded_at.asc())
        )
        return self.session.scalars(stmt).all()

    def update_status(self, sensor_id: str, status: SensorStatus) -> Optional[Sensor]:
        """Update operational state of a sensor (e.g. offline, maintenance)."""
        sensor = self.get(sensor_id)
        if not sensor:
            return None
        sensor.status = status
        self.session.add(sensor)
        self.session.flush()
        return sensor

    def get_sensor_health_summary(self) -> Dict[str, Any]:
        """Get aggregate operational health statistics across all sensor stations."""
        total = self.count()
        online = self.count([Sensor.status == SensorStatus.ONLINE])
        offline = self.count([Sensor.status == SensorStatus.OFFLINE])
        maintenance = self.count([Sensor.status == SensorStatus.MAINTENANCE])
        error = self.count([Sensor.status == SensorStatus.ERROR])

        alarm_count = len(self.get_sensors_in_alarm())

        return {
            "total_sensors": total,
            "online": online,
            "offline": offline,
            "maintenance": maintenance,
            "error": error,
            "breaching_thresholds": alarm_count,
            "operational_percentage": round((online / total * 100.0) if total > 0 else 0.0, 1),
        }
