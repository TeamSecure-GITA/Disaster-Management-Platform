"""
IoT sensor data ingestion.

Handles telemetry streams from field-deployed sensor networks including:
- Water-level gauges (rivers, reservoirs, coastal tidal gauges)
- Seismic monitoring stations
- Soil moisture and slope stability sensors (landslide early warning)
- Air quality / particulate matter sensors (industrial / wildfire)
- Weather station micro-sensors

All readings are normalised into a ``SensorReading`` dataclass with
embedded anomaly flagging based on configurable operational thresholds.
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


logger = logging.getLogger("disaster-management.data.ingestion.sensors")


class SensorType(str, Enum):
    WATER_LEVEL = "water_level"
    SEISMIC = "seismic"
    SOIL_MOISTURE = "soil_moisture"
    RAINFALL = "rainfall"
    AIR_QUALITY = "air_quality"
    TEMPERATURE = "temperature"
    WIND = "wind"
    FLOOD_GAUGE = "flood_gauge"
    SLOPE_STABILITY = "slope_stability"
    TIDAL_GAUGE = "tidal_gauge"
    GENERIC = "generic"


class SensorStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    CALIBRATING = "calibrating"
    UNKNOWN = "unknown"


@dataclass
class SensorReading:
    """
    Normalised sensor telemetry observation.

    A single ``SensorReading`` represents one timestamped measurement
    from one physical sensor unit.
    """

    sensor_id: str
    sensor_type: SensorType
    station_name: str
    latitude: float
    longitude: float
    value: float
    unit: str
    observed_at: str
    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    sensor_status: SensorStatus = SensorStatus.ONLINE
    battery_pct: Optional[float] = None
    signal_strength_dbm: Optional[float] = None
    alert_triggered: bool = False
    alert_threshold: Optional[float] = None
    alert_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["sensor_type"] = self.sensor_type.value
        d["sensor_status"] = self.sensor_status.value
        return d


@dataclass
class SensorAlert:
    """Alert generated when a sensor reading exceeds a critical threshold."""

    sensor_id: str
    sensor_type: str
    station_name: str
    latitude: float
    longitude: float
    value: float
    unit: str
    threshold: float
    severity: str       # "warning" | "critical"
    message: str
    triggered_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Threshold configuration (operational defaults; override via settings)
# ---------------------------------------------------------------------------

_DEFAULT_THRESHOLDS: Dict[str, Dict[str, float]] = {
    SensorType.WATER_LEVEL.value: {
        "warning": 5.0,    # metres above datum
        "critical": 8.0,
    },
    SensorType.FLOOD_GAUGE.value: {
        "warning": 3.5,
        "critical": 6.0,
    },
    SensorType.SEISMIC.value: {
        "warning": 4.0,    # Richter magnitude or PGA in gals
        "critical": 6.0,
    },
    SensorType.SOIL_MOISTURE.value: {
        "warning": 85.0,   # % saturation
        "critical": 95.0,
    },
    SensorType.RAINFALL.value: {
        "warning": 50.0,   # mm / hour
        "critical": 100.0,
    },
    SensorType.AIR_QUALITY.value: {
        "warning": 200.0,  # AQI
        "critical": 300.0,
    },
    SensorType.SLOPE_STABILITY.value: {
        "warning": 0.6,    # dimensionless safety factor (<1 = unstable)
        "critical": 0.8,
    },
    SensorType.TIDAL_GAUGE.value: {
        "warning": 1.5,    # m surge above normal
        "critical": 3.0,
    },
}


def _evaluate_threshold(
    sensor_type: SensorType,
    value: float,
    custom_thresholds: Optional[Dict[str, float]] = None,
) -> tuple[bool, Optional[float], Optional[str]]:
    """
    Returns (alert_triggered, threshold_crossed, severity_message).
    """
    thresholds = (
        custom_thresholds
        or _DEFAULT_THRESHOLDS.get(sensor_type.value, {})
    )
    crit = thresholds.get("critical")
    warn = thresholds.get("warning")

    # Slope stability is alert when value is LOW (unsafe)
    if sensor_type == SensorType.SLOPE_STABILITY:
        if crit and value <= crit:
            return True, crit, f"CRITICAL: slope safety factor {value:.2f} ≤ {crit}"
        if warn and value <= warn:
            return True, warn, f"WARNING: slope safety factor {value:.2f} ≤ {warn}"
        return False, None, None

    if crit is not None and value >= crit:
        return True, crit, f"CRITICAL: {value:.2f} ≥ threshold {crit}"
    if warn is not None and value >= warn:
        return True, warn, f"WARNING: {value:.2f} ≥ threshold {warn}"
    return False, None, None


class SensorIngester:
    """
    Ingest and normalise sensor telemetry payloads from multiple sensor types.

    Designed to receive push payloads (e.g. from MQTT bridges or HTTP webhooks)
    and produce normalised ``SensorReading`` objects with embedded alert flags.

    Example::

        ingester = SensorIngester()
        reading = ingester.ingest({
            "sensor_id": "WL-001",
            "sensor_type": "water_level",
            "value": 7.2,
            "unit": "m",
            "station_name": "Brahmaputra at Guwahati",
            "latitude": 26.1158,
            "longitude": 91.7086,
            "timestamp": "2026-09-21T14:00:00+00:00",
        })
    """

    def __init__(
        self,
        custom_thresholds: Optional[Dict[str, Dict[str, float]]] = None,
    ):
        self._thresholds: Dict[str, Dict[str, float]] = (
            {**_DEFAULT_THRESHOLDS, **(custom_thresholds or {})}
        )
        self._alert_log: List[SensorAlert] = []

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    def ingest(self, payload: Dict[str, Any]) -> SensorReading:
        """
        Parse and normalise a raw sensor payload dict into a ``SensorReading``.

        Mandatory keys: ``sensor_id``, ``value``, ``unit``
        Optional keys:  ``sensor_type``, ``timestamp``, ``latitude``,
                        ``longitude``, ``station_name``, ``battery_pct``,
                        ``signal_strength_dbm``
        """
        sensor_id = payload.get("sensor_id", "unknown")
        raw_type = payload.get("sensor_type", "generic")
        try:
            sensor_type = SensorType(raw_type)
        except ValueError:
            sensor_type = SensorType.GENERIC

        value = float(payload.get("value", 0.0))
        unit = payload.get("unit", "")
        observed_at = payload.get(
            "timestamp",
            datetime.now(timezone.utc).isoformat(),
        )

        raw_status = payload.get("status", "online")
        try:
            status = SensorStatus(raw_status)
        except ValueError:
            status = SensorStatus.UNKNOWN

        battery = payload.get("battery_pct")
        signal = payload.get("signal_strength_dbm")

        # Threshold evaluation
        thresholds = self._thresholds.get(sensor_type.value)
        triggered, threshold_val, msg = _evaluate_threshold(
            sensor_type, value, thresholds
        )

        if triggered and threshold_val is not None:
            alert = SensorAlert(
                sensor_id=sensor_id,
                sensor_type=sensor_type.value,
                station_name=payload.get("station_name", "unknown"),
                latitude=float(payload.get("latitude", 0.0)),
                longitude=float(payload.get("longitude", 0.0)),
                value=value,
                unit=unit,
                threshold=threshold_val,
                severity="critical" if "CRITICAL" in (msg or "") else "warning",
                message=msg or "",
                triggered_at=datetime.now(timezone.utc).isoformat(),
            )
            self._alert_log.append(alert)
            logger.warning("Sensor alert: %s — %s", sensor_id, msg)

        return SensorReading(
            sensor_id=sensor_id,
            sensor_type=sensor_type,
            station_name=payload.get("station_name", "unknown"),
            latitude=float(payload.get("latitude", 0.0)),
            longitude=float(payload.get("longitude", 0.0)),
            value=value,
            unit=unit,
            observed_at=observed_at,
            sensor_status=status,
            battery_pct=float(battery) if battery is not None else None,
            signal_strength_dbm=float(signal) if signal is not None else None,
            alert_triggered=triggered,
            alert_threshold=threshold_val,
            alert_message=msg,
            metadata=payload.get("metadata", {}),
        )

    def ingest_batch(self, payloads: List[Dict[str, Any]]) -> List[SensorReading]:
        """Ingest a batch of raw sensor payloads."""
        return [self.ingest(p) for p in payloads]

    # ------------------------------------------------------------------
    # Alert log access
    # ------------------------------------------------------------------

    def get_active_alerts(self) -> List[SensorAlert]:
        return list(self._alert_log)

    def clear_alert_log(self) -> None:
        self._alert_log.clear()

    def alert_count(self) -> int:
        return len(self._alert_log)
