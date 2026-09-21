"""
Drone / UAV telemetry and imagery metadata ingestion.

Supports data feeds from:
- NDRF / SDRF field drone fleets
- Search-and-rescue UAS units
- Infrastructure survey drones
- Autonomous flood-mapping UAV swarms

Normalises real-time telemetry (GPS, battery, altitude, heading) and
mission-level metadata (coverage polygon, captured images, detected objects).
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


logger = logging.getLogger("disaster-management.data.ingestion.drone")


class DroneStatus(str, Enum):
    IDLE = "idle"
    PRE_FLIGHT = "pre_flight"
    EN_ROUTE = "en_route"
    ON_MISSION = "on_mission"
    RETURNING = "returning"
    EMERGENCY_LAND = "emergency_land"
    GROUNDED = "grounded"
    LOST_COMMS = "lost_comms"


class MissionType(str, Enum):
    FLOOD_MAPPING = "flood_mapping"
    SEARCH_RESCUE = "search_rescue"
    INFRASTRUCTURE_SURVEY = "infrastructure_survey"
    WILDFIRE_MONITORING = "wildfire_monitoring"
    SUPPLY_DELIVERY = "supply_delivery"
    CROWD_MONITORING = "crowd_monitoring"
    DAMAGE_ASSESSMENT = "damage_assessment"
    GENERAL = "general"


class DronePayloadType(str, Enum):
    RGB_CAMERA = "rgb_camera"
    THERMAL_CAMERA = "thermal_camera"
    MULTISPECTRAL = "multispectral"
    LiDAR = "lidar"
    SAR_MINI = "sar_mini"
    SUPPLY_DELIVERY = "supply_delivery"
    SPEAKER = "speaker"


@dataclass
class DroneTelemetry:
    """
    Real-time telemetry snapshot from a single drone unit.

    Published periodically (typically every 1–5 seconds) by the drone
    ground station or OGC SensorThings API relay.
    """

    drone_id: str
    callsign: str
    status: DroneStatus
    latitude: float
    longitude: float
    altitude_m: float                     # Metres above mean sea level
    heading_deg: float                    # 0 = North, clockwise
    ground_speed_ms: float
    vertical_speed_ms: float = 0.0
    battery_pct: float = 100.0
    range_remaining_km: float = 0.0
    signal_rssi_dbm: Optional[float] = None
    gps_fix_quality: int = 3              # 0=none, 1=gps, 2=dgps, 3=RTK
    operator_id: Optional[str] = None
    mission_id: Optional[str] = None
    observed_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["status"] = self.status.value
        return d

    @property
    def is_low_battery(self) -> bool:
        return self.battery_pct < 20.0

    @property
    def is_signal_weak(self) -> bool:
        return self.signal_rssi_dbm is not None and self.signal_rssi_dbm < -85.0


@dataclass
class DroneImageCapture:
    """Metadata record for an image captured during a drone mission."""

    image_id: str
    drone_id: str
    mission_id: str
    latitude: float
    longitude: float
    altitude_m: float
    heading_deg: float
    captured_at: str
    storage_path: Optional[str] = None      # GCS / S3 object path
    payload_type: DronePayloadType = DronePayloadType.RGB_CAMERA
    ground_resolution_cm: Optional[float] = None
    detected_objects: List[str] = field(default_factory=list)
    ai_processed: bool = False
    ingested_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["payload_type"] = self.payload_type.value
        return d


@dataclass
class DroneMission:
    """
    Persistent mission record tracking a drone sortie from launch to landing.
    """

    mission_id: str
    drone_id: str
    mission_type: MissionType
    operator_id: str
    target_area_name: str
    planned_waypoints: List[Dict[str, float]]  # [{"lat": ..., "lon": ..., "alt_m": ...}]
    status: DroneStatus = DroneStatus.PRE_FLIGHT
    launched_at: Optional[str] = None
    completed_at: Optional[str] = None
    total_images_captured: int = 0
    coverage_area_sqkm: float = 0.0
    payload_type: DronePayloadType = DronePayloadType.RGB_CAMERA
    findings_summary: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["mission_type"] = self.mission_type.value
        d["status"] = self.status.value
        d["payload_type"] = self.payload_type.value
        return d


class DroneIngester:
    """
    Ingest and normalise drone telemetry, image metadata, and mission records.

    In production, telemetry arrives via:
    - WebSocket push from drone GCS (Ground Control Station)
    - OGC SensorThings API
    - MQTT topic subscriptions

    Example::

        ingester = DroneIngester()
        telemetry = ingester.ingest_telemetry({
            "drone_id": "NDRF-UAV-01",
            "callsign": "Eagle-1",
            "status": "on_mission",
            "latitude": 26.15,
            "longitude": 91.72,
            "altitude_m": 120.0,
            "heading_deg": 45.0,
            "ground_speed_ms": 12.0,
            "battery_pct": 68.0,
        })
    """

    def __init__(self):
        self._active_telemetry: Dict[str, DroneTelemetry] = {}
        self._missions: Dict[str, DroneMission] = {}
        self._image_index: List[DroneImageCapture] = []

    # ------------------------------------------------------------------
    # Telemetry ingestion
    # ------------------------------------------------------------------

    def ingest_telemetry(self, payload: Dict[str, Any]) -> DroneTelemetry:
        """Parse and store the latest telemetry snapshot for a drone."""
        drone_id = payload.get("drone_id", "unknown")
        raw_status = payload.get("status", "idle")
        try:
            status = DroneStatus(raw_status)
        except ValueError:
            status = DroneStatus.IDLE

        telemetry = DroneTelemetry(
            drone_id=drone_id,
            callsign=payload.get("callsign", drone_id),
            status=status,
            latitude=float(payload.get("latitude", 0.0)),
            longitude=float(payload.get("longitude", 0.0)),
            altitude_m=float(payload.get("altitude_m", 0.0)),
            heading_deg=float(payload.get("heading_deg", 0.0)),
            ground_speed_ms=float(payload.get("ground_speed_ms", 0.0)),
            vertical_speed_ms=float(payload.get("vertical_speed_ms", 0.0)),
            battery_pct=float(payload.get("battery_pct", 100.0)),
            range_remaining_km=float(payload.get("range_remaining_km", 0.0)),
            signal_rssi_dbm=payload.get("signal_rssi_dbm"),
            gps_fix_quality=int(payload.get("gps_fix_quality", 3)),
            operator_id=payload.get("operator_id"),
            mission_id=payload.get("mission_id"),
            observed_at=payload.get(
                "observed_at",
                datetime.now(timezone.utc).isoformat(),
            ),
        )

        if telemetry.is_low_battery:
            logger.warning(
                "LOW BATTERY: drone %s at %.1f%% — RTH recommended.",
                drone_id, telemetry.battery_pct,
            )

        if telemetry.is_signal_weak:
            logger.warning(
                "WEAK SIGNAL: drone %s RSSI=%.1f dBm.",
                drone_id, telemetry.signal_rssi_dbm,
            )

        self._active_telemetry[drone_id] = telemetry
        return telemetry

    # ------------------------------------------------------------------
    # Image metadata ingestion
    # ------------------------------------------------------------------

    def ingest_image(self, payload: Dict[str, Any]) -> DroneImageCapture:
        """Register a captured image metadata record."""
        raw_payload = payload.get("payload_type", "rgb_camera")
        try:
            pt = DronePayloadType(raw_payload)
        except ValueError:
            pt = DronePayloadType.RGB_CAMERA

        cap = DroneImageCapture(
            image_id=payload.get("image_id", f"img-{len(self._image_index):06d}"),
            drone_id=payload.get("drone_id", "unknown"),
            mission_id=payload.get("mission_id", "unknown"),
            latitude=float(payload.get("latitude", 0.0)),
            longitude=float(payload.get("longitude", 0.0)),
            altitude_m=float(payload.get("altitude_m", 0.0)),
            heading_deg=float(payload.get("heading_deg", 0.0)),
            captured_at=payload.get(
                "captured_at",
                datetime.now(timezone.utc).isoformat(),
            ),
            storage_path=payload.get("storage_path"),
            payload_type=pt,
            ground_resolution_cm=payload.get("ground_resolution_cm"),
            detected_objects=payload.get("detected_objects", []),
            ai_processed=bool(payload.get("ai_processed", False)),
        )
        self._image_index.append(cap)
        return cap

    # ------------------------------------------------------------------
    # Mission management
    # ------------------------------------------------------------------

    def register_mission(self, mission: DroneMission) -> None:
        self._missions[mission.mission_id] = mission

    def update_mission_status(
        self,
        mission_id: str,
        status: DroneStatus,
        findings: Optional[str] = None,
        images_captured: int = 0,
        coverage_sqkm: float = 0.0,
    ) -> bool:
        m = self._missions.get(mission_id)
        if not m:
            return False
        m.status = status
        m.total_images_captured += images_captured
        m.coverage_area_sqkm += coverage_sqkm
        if findings:
            m.findings_summary = findings
        if status == DroneStatus.RETURNING and not m.completed_at:
            m.completed_at = datetime.now(timezone.utc).isoformat()
        return True

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_live_fleet(self) -> List[DroneTelemetry]:
        return list(self._active_telemetry.values())

    def get_active_missions(self) -> List[DroneMission]:
        return [
            m for m in self._missions.values()
            if m.status in (DroneStatus.ON_MISSION, DroneStatus.EN_ROUTE)
        ]

    def get_images_for_mission(self, mission_id: str) -> List[DroneImageCapture]:
        return [img for img in self._image_index if img.mission_id == mission_id]
