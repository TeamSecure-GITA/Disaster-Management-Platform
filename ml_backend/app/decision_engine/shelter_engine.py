"""
Emergency shelter matching, capacity management, and assignment engine.

Manages emergency shelter registries, evaluates suitability for incoming populations,
performs occupancy tracking, and resolves optimal person-to-shelter assignments
considering proximity, accessibility, medical capability, and available capacity.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence


class ShelterStatus(str, Enum):
    STANDBY = "standby"       # Not yet activated
    OPEN = "open"             # Accepting evacuees
    FULL = "full"             # At or beyond capacity
    CLOSED = "closed"         # Deactivated
    DAMAGED = "damaged"       # Structurally compromised


class ShelterType(str, Enum):
    COMMUNITY_CENTER = "community_center"
    SCHOOL = "school"
    STADIUM = "stadium"
    TEMPLE_MOSQUE_CHURCH = "temple_mosque_church"
    GOVERNMENT_BUILDING = "government_building"
    RELIEF_CAMP = "relief_camp"
    TRANSIT_CAMP = "transit_camp"


@dataclass
class Shelter:
    """An emergency shelter facility."""

    shelter_id: str
    name: str
    shelter_type: ShelterType
    latitude: float
    longitude: float
    total_capacity: int
    current_occupancy: int = 0
    accessible_for_mobility_impaired: bool = False
    has_medical_unit: bool = False
    has_generator: bool = False
    drinking_water_supply_days: float = 3.0
    food_supply_days: float = 3.0
    status: ShelterStatus = ShelterStatus.STANDBY
    managing_agency: str = "District Administration"
    contact_number: str = ""

    @property
    def available_capacity(self) -> int:
        return max(0, self.total_capacity - self.current_occupancy)

    @property
    def utilization_pct(self) -> float:
        if self.total_capacity == 0:
            return 0.0
        return round((self.current_occupancy / self.total_capacity) * 100.0, 2)

    @property
    def is_accepting(self) -> bool:
        return (
            self.status in (ShelterStatus.OPEN, ShelterStatus.STANDBY)
            and self.available_capacity > 0
        )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["shelter_type"] = self.shelter_type.value
        d["status"] = self.status.value
        d["available_capacity"] = self.available_capacity
        d["utilization_pct"] = self.utilization_pct
        d["is_accepting"] = self.is_accepting
        return d


@dataclass
class ShelterAssignment:
    """Resolved shelter assignment for an evacuee group."""

    assignment_id: str
    shelter_id: str
    shelter_name: str
    shelter_latitude: float
    shelter_longitude: float
    persons_assigned: int
    distance_km: float
    estimated_travel_hours: float
    priority_met: bool
    accessibility_met: bool
    medical_unit_available: bool
    assigned_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ShelterSystemStatus:
    """System-wide shelter capacity and operational summary."""

    total_shelters: int
    open_shelters: int
    total_capacity: int
    total_current_occupancy: int
    total_available_capacity: int
    overall_utilization_pct: float
    full_shelters: int
    accessible_shelters: int
    shelters_with_medical: bool
    generated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    return earth_r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class ShelterEngine:
    """
    Manages emergency shelter registries, routes evacuees, and tracks occupancy.

    Example::

        engine = ShelterEngine()
        engine.register_shelter(Shelter(...))
        engine.open_shelter("S-001")
        assignment = engine.assign(
            origin_lat=26.1,
            origin_lon=91.7,
            persons=500,
            require_accessible=True,
        )
    """

    OVERLOAD_THRESHOLD = 0.95        # Treat shelter as full above 95% utilization
    AVG_TRANSPORT_SPEED_KMH = 40.0

    def __init__(self):
        self._shelters: Dict[str, Shelter] = {}

    # ------------------------------------------------------------------
    # Registry
    # ------------------------------------------------------------------

    def register_shelter(self, shelter: Shelter) -> None:
        self._shelters[shelter.shelter_id] = shelter

    def register_shelters(self, shelters: Sequence[Shelter]) -> None:
        for s in shelters:
            self.register_shelter(s)

    def get_shelter(self, shelter_id: str) -> Optional[Shelter]:
        return self._shelters.get(shelter_id)

    def open_shelter(self, shelter_id: str) -> bool:
        s = self._shelters.get(shelter_id)
        if s and s.status in (ShelterStatus.STANDBY, ShelterStatus.CLOSED):
            s.status = ShelterStatus.OPEN
            return True
        return False

    def close_shelter(self, shelter_id: str) -> bool:
        s = self._shelters.get(shelter_id)
        if s:
            s.status = ShelterStatus.CLOSED
            return True
        return False

    # ------------------------------------------------------------------
    # Occupancy
    # ------------------------------------------------------------------

    def admit_persons(self, shelter_id: str, count: int) -> bool:
        """Admit a number of persons into a shelter, capped at capacity."""
        s = self._shelters.get(shelter_id)
        if s is None or not s.is_accepting:
            return False
        admittable = min(count, s.available_capacity)
        s.current_occupancy += admittable
        if s.utilization_pct >= self.OVERLOAD_THRESHOLD * 100.0:
            s.status = ShelterStatus.FULL
        return admittable == count  # True = fully admitted, False = partial

    def discharge_persons(self, shelter_id: str, count: int) -> None:
        """Remove persons from a shelter (evacuation ended / returned home)."""
        s = self._shelters.get(shelter_id)
        if s:
            s.current_occupancy = max(0, s.current_occupancy - count)
            if s.status == ShelterStatus.FULL and s.utilization_pct < 100.0:
                s.status = ShelterStatus.OPEN

    # ------------------------------------------------------------------
    # Assignment
    # ------------------------------------------------------------------

    def assign(
        self,
        origin_lat: float,
        origin_lon: float,
        persons: int,
        require_accessible: bool = False,
        require_medical: bool = False,
        max_radius_km: float = 50.0,
    ) -> Optional[ShelterAssignment]:
        """
        Find and reserve the best-matched shelter for an evacuee group.

        Preferences: accessible shelters, medical units, nearest with sufficient capacity.
        """
        import uuid

        candidates = [
            s for s in self._shelters.values()
            if s.is_accepting and s.available_capacity >= max(1, persons // 2)
        ]

        if require_accessible:
            candidates = [s for s in candidates if s.accessible_for_mobility_impaired]
        if require_medical:
            candidates = [s for s in candidates if s.has_medical_unit]

        if not candidates:
            # Relax constraints
            candidates = [s for s in self._shelters.values() if s.is_accepting and s.available_capacity > 0]

        if not candidates:
            return None

        # Score: proximity weighted 60%, remaining capacity weighted 40%
        def shelter_score(s: Shelter) -> float:
            dist = _haversine_km(origin_lat, origin_lon, s.latitude, s.longitude)
            if dist > max_radius_km:
                return float("inf")
            dist_score = dist / max(max_radius_km, 1.0)
            cap_score = 1.0 - (s.available_capacity / max(s.total_capacity, 1))
            return 0.60 * dist_score + 0.40 * cap_score

        candidates.sort(key=shelter_score)
        best = candidates[0]
        dist = _haversine_km(origin_lat, origin_lon, best.latitude, best.longitude)

        if dist > max_radius_km:
            return None

        admitted_fully = self.admit_persons(best.shelter_id, persons)
        actual_assigned = min(persons, best.available_capacity + persons)  # after admit

        return ShelterAssignment(
            assignment_id=f"assign-{uuid.uuid4().hex[:8]}",
            shelter_id=best.shelter_id,
            shelter_name=best.name,
            shelter_latitude=best.latitude,
            shelter_longitude=best.longitude,
            persons_assigned=persons,
            distance_km=round(dist, 2),
            estimated_travel_hours=round(dist / self.AVG_TRANSPORT_SPEED_KMH, 2),
            priority_met=admitted_fully,
            accessibility_met=best.accessible_for_mobility_impaired,
            medical_unit_available=best.has_medical_unit,
            assigned_at=datetime.now(timezone.utc).isoformat(),
        )

    def search_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
        only_open: bool = True,
    ) -> List[Dict[str, Any]]:
        """Return shelters within radius, sorted by distance ascending."""
        results = []
        for s in self._shelters.values():
            if only_open and not s.is_accepting:
                continue
            dist = _haversine_km(latitude, longitude, s.latitude, s.longitude)
            if dist <= radius_km:
                sd = s.to_dict()
                sd["distance_km"] = round(dist, 2)
                results.append(sd)
        results.sort(key=lambda x: x["distance_km"])
        return results

    # ------------------------------------------------------------------
    # System status
    # ------------------------------------------------------------------

    def get_system_status(self) -> ShelterSystemStatus:
        all_shelters = list(self._shelters.values())
        open_s = [s for s in all_shelters if s.status == ShelterStatus.OPEN]
        full_s = [s for s in all_shelters if s.status == ShelterStatus.FULL]
        total_cap = sum(s.total_capacity for s in all_shelters)
        total_occ = sum(s.current_occupancy for s in all_shelters)
        total_avail = sum(s.available_capacity for s in all_shelters)
        util_pct = (total_occ / total_cap * 100.0) if total_cap > 0 else 0.0
        accessible_count = sum(1 for s in all_shelters if s.accessible_for_mobility_impaired)
        has_medical_any = any(s.has_medical_unit for s in all_shelters)

        return ShelterSystemStatus(
            total_shelters=len(all_shelters),
            open_shelters=len(open_s),
            total_capacity=total_cap,
            total_current_occupancy=total_occ,
            total_available_capacity=total_avail,
            overall_utilization_pct=round(util_pct, 2),
            full_shelters=len(full_s),
            accessible_shelters=accessible_count,
            shelters_with_medical=has_medical_any,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
