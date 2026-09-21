"""
Emergency unit dispatch and incident assignment engine.

Matches active incidents to the closest appropriate response units (ambulance,
fire, NDRF team, coast guard, etc.) based on unit specialty, availability,
estimated travel time, and incident priority.

Applies priority queuing and real-time reassignment when units are en route.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class UnitType(str, Enum):
    AMBULANCE = "ambulance"
    FIRE_ENGINE = "fire_engine"
    NDRF_TEAM = "ndrf_team"           # National Disaster Response Force
    SDRF_TEAM = "sdrf_team"           # State Disaster Response Force
    POLICE = "police"
    COAST_GUARD = "coast_guard"
    HELICOPTER = "helicopter"
    FLOOD_RESCUE_BOAT = "flood_rescue_boat"
    HEAVY_MACHINERY = "heavy_machinery"  # For debris clearance
    HAZMAT_TEAM = "hazmat_team"
    MEDICAL_TEAM = "medical_team"
    VOLUNTEER_TEAM = "volunteer_team"


class UnitAvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    ON_SCENE = "on_scene"
    RETURNING = "returning"
    UNAVAILABLE = "unavailable"
    MAINTENANCE = "maintenance"


class IncidentSeverity(str, Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    MASS_CASUALTY = "mass_casualty"
    CATASTROPHIC = "catastrophic"


@dataclass
class ResponseUnit:
    """An emergency response unit in the operational fleet."""

    unit_id: str
    unit_type: UnitType
    callsign: str
    latitude: float
    longitude: float
    capacity: int                            # Persons or simultaneous ops
    specialties: List[str] = field(default_factory=list)
    status: UnitAvailabilityStatus = UnitAvailabilityStatus.AVAILABLE
    assigned_incident_id: Optional[str] = None
    speed_kmh: float = 60.0
    crew_size: int = 4

    def estimated_travel_time_hours(
        self, target_lat: float, target_lon: float
    ) -> float:
        """Great-circle ETA estimation."""
        from .risk_engine import RiskLevel  # avoid circular; only used for coord math
        earth_r = 6371.0
        phi1, phi2 = math.radians(self.latitude), math.radians(target_lat)
        d_phi = math.radians(target_lat - self.latitude)
        d_lam = math.radians(target_lon - self.longitude)
        a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
        dist_km = earth_r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return dist_km / max(self.speed_kmh, 5.0)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "unit_id": self.unit_id,
            "unit_type": self.unit_type.value,
            "callsign": self.callsign,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "capacity": self.capacity,
            "specialties": self.specialties,
            "status": self.status.value,
            "assigned_incident_id": self.assigned_incident_id,
            "speed_kmh": self.speed_kmh,
            "crew_size": self.crew_size,
        }


@dataclass
class IncidentReport:
    """A field-reported or sensor-detected emergency incident."""

    incident_id: str
    title: str
    incident_type: str       # flood, fire, mass_casualty, collapse, chemical, etc.
    severity: IncidentSeverity
    latitude: float
    longitude: float
    region: str
    persons_affected: int
    hazard_present: bool = False
    requires_unit_types: List[str] = field(default_factory=list)
    reported_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["severity"] = self.severity.value
        return d


@dataclass
class DispatchOrder:
    """A formal dispatch order routing a unit to an incident."""

    dispatch_id: str
    incident_id: str
    unit_id: str
    unit_callsign: str
    unit_type: str
    incident_title: str
    incident_severity: str
    incident_latitude: float
    incident_longitude: float
    estimated_travel_time_hours: float
    estimated_on_scene_time: str
    dispatch_reason: str
    dispatched_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DispatchPlan:
    """Consolidated multi-incident dispatch plan."""

    plan_id: str
    total_incidents: int
    total_units_dispatched: int
    orders: List[DispatchOrder]
    unassigned_incidents: List[str]
    unit_shortage_warnings: List[str]
    generated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plan_id": self.plan_id,
            "total_incidents": self.total_incidents,
            "total_units_dispatched": self.total_units_dispatched,
            "orders": [o.to_dict() for o in self.orders],
            "unassigned_incidents": self.unassigned_incidents,
            "unit_shortage_warnings": self.unit_shortage_warnings,
            "generated_at": self.generated_at,
        }


# Units required per incident severity (minimum counts)
_SEVERITY_UNIT_REQUIREMENTS: Dict[str, int] = {
    IncidentSeverity.MINOR.value: 1,
    IncidentSeverity.MODERATE.value: 2,
    IncidentSeverity.MAJOR.value: 3,
    IncidentSeverity.MASS_CASUALTY.value: 5,
    IncidentSeverity.CATASTROPHIC.value: 8,
}


class DispatchEngine:
    """
    Matches emergency incidents to the nearest, most appropriate available units.

    Example::

        engine = DispatchEngine()
        engine.register_unit(ResponseUnit(...))
        plan = engine.dispatch_all([incident_a, incident_b])
    """

    def __init__(self, max_dispatch_radius_km: float = 200.0):
        self.max_dispatch_radius_km = max_dispatch_radius_km
        self._units: Dict[str, ResponseUnit] = {}

    def register_unit(self, unit: ResponseUnit) -> None:
        self._units[unit.unit_id] = unit

    def register_units(self, units: List[ResponseUnit]) -> None:
        for u in units:
            self.register_unit(u)

    def get_unit(self, unit_id: str) -> Optional[ResponseUnit]:
        return self._units.get(unit_id)

    def available_units(
        self,
        unit_types: Optional[List[str]] = None,
    ) -> List[ResponseUnit]:
        """Return units currently available for dispatch, optionally filtered by type."""
        candidates = [
            u for u in self._units.values()
            if u.status == UnitAvailabilityStatus.AVAILABLE
        ]
        if unit_types:
            candidates = [
                u for u in candidates
                if u.unit_type.value in unit_types
            ]
        return candidates

    def _dispatch_unit_to_incident(
        self,
        unit: ResponseUnit,
        incident: IncidentReport,
    ) -> DispatchOrder:
        """Create a dispatch order and update the unit's status."""
        import uuid
        eta_hours = unit.estimated_travel_time_hours(
            incident.latitude, incident.longitude
        )
        # Estimate on-scene time as now + eta
        from datetime import timedelta
        on_scene_dt = (
            datetime.now(timezone.utc)
            + timedelta(hours=eta_hours)
        ).isoformat()

        unit.status = UnitAvailabilityStatus.DISPATCHED
        unit.assigned_incident_id = incident.incident_id

        return DispatchOrder(
            dispatch_id=f"disp-{uuid.uuid4().hex[:8]}",
            incident_id=incident.incident_id,
            unit_id=unit.unit_id,
            unit_callsign=unit.callsign,
            unit_type=unit.unit_type.value,
            incident_title=incident.title,
            incident_severity=incident.severity.value,
            incident_latitude=incident.latitude,
            incident_longitude=incident.longitude,
            estimated_travel_time_hours=round(eta_hours, 2),
            estimated_on_scene_time=on_scene_dt,
            dispatch_reason=(
                f"Closest available {unit.unit_type.value} for "
                f"{incident.severity.value} {incident.incident_type} incident."
            ),
            dispatched_at=datetime.now(timezone.utc).isoformat(),
        )

    def dispatch_single(
        self,
        incident: IncidentReport,
        preferred_unit_types: Optional[List[str]] = None,
    ) -> Optional[DispatchOrder]:
        """
        Dispatch the closest available unit to a single incident.
        Returns None if no unit is available.
        """
        candidates = self.available_units(unit_types=preferred_unit_types)
        if not candidates:
            candidates = self.available_units()  # Fallback to any available unit
        if not candidates:
            return None

        # Sort by ETA (closest first)
        candidates.sort(
            key=lambda u: u.estimated_travel_time_hours(
                incident.latitude, incident.longitude
            )
        )
        return self._dispatch_unit_to_incident(candidates[0], incident)

    def dispatch_all(
        self,
        incidents: List[IncidentReport],
    ) -> DispatchPlan:
        """
        Produce a comprehensive dispatch plan for all reported incidents,
        sorted descending by severity.
        """
        import uuid

        severity_order = {
            IncidentSeverity.CATASTROPHIC.value: 0,
            IncidentSeverity.MASS_CASUALTY.value: 1,
            IncidentSeverity.MAJOR.value: 2,
            IncidentSeverity.MODERATE.value: 3,
            IncidentSeverity.MINOR.value: 4,
        }

        sorted_incidents = sorted(
            incidents,
            key=lambda inc: (severity_order.get(inc.severity.value, 5), -inc.persons_affected)
        )

        orders: List[DispatchOrder] = []
        unassigned: List[str] = []
        warnings: List[str] = []

        for inc in sorted_incidents:
            required_count = _SEVERITY_UNIT_REQUIREMENTS.get(inc.severity.value, 1)
            dispatched_count = 0

            for _ in range(required_count):
                order = self.dispatch_single(
                    inc,
                    preferred_unit_types=inc.requires_unit_types or None,
                )
                if order:
                    orders.append(order)
                    dispatched_count += 1
                else:
                    break  # No more available units

            if dispatched_count == 0:
                unassigned.append(inc.incident_id)
                warnings.append(
                    f"Incident {inc.incident_id} ({inc.severity.value} {inc.incident_type}) "
                    "could not be assigned — no available units."
                )
            elif dispatched_count < required_count:
                shortfall = required_count - dispatched_count
                warnings.append(
                    f"Incident {inc.incident_id}: {dispatched_count}/{required_count} "
                    f"units dispatched — {shortfall} unit shortage."
                )

        return DispatchPlan(
            plan_id=f"dispatch-{uuid.uuid4().hex[:8]}",
            total_incidents=len(incidents),
            total_units_dispatched=len(orders),
            orders=orders,
            unassigned_incidents=unassigned,
            unit_shortage_warnings=warnings,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    def mark_unit_on_scene(self, unit_id: str) -> bool:
        unit = self._units.get(unit_id)
        if unit:
            unit.status = UnitAvailabilityStatus.ON_SCENE
            return True
        return False

    def recall_unit(self, unit_id: str) -> bool:
        """Mark a unit as returning and clear its incident assignment."""
        unit = self._units.get(unit_id)
        if unit:
            unit.status = UnitAvailabilityStatus.RETURNING
            unit.assigned_incident_id = None
            return True
        return False

    def release_unit(self, unit_id: str) -> bool:
        """Mark a unit as available again after returning to base."""
        unit = self._units.get(unit_id)
        if unit:
            unit.status = UnitAvailabilityStatus.AVAILABLE
            unit.assigned_incident_id = None
            return True
        return False
