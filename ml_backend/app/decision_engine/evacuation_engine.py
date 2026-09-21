"""
Evacuation route planning and zone-sequenced mobilization engine.

Determines optimal evacuation corridor assignments, departure sequencing,
transport mode allocation, and ETA estimation for affected populations.

Considers road capacity, shelter availability, congestion factors, and
special-needs populations for compliant, equitable evacuation planning.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


class TransportMode(str, Enum):
    SELF_EVACUATE = "self_evacuate"
    BUS = "bus"
    TRUCK = "truck"
    BOAT = "boat"
    HELICOPTER = "helicopter"
    WALKING = "walking"


class EvacuationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    PARTIALLY_COMPLETE = "partially_complete"


@dataclass
class EvacuationZone:
    """A geographically bounded evacuation zone."""

    zone_id: str
    name: str
    population: int
    priority: int              # 1 = most urgent (coastal, flood-plain)
    latitude: float
    longitude: float
    special_needs_count: int = 0   # Individuals requiring assisted evacuation
    mobility_limited_pct: float = 0.0  # Fraction requiring transport support
    status: EvacuationStatus = EvacuationStatus.PENDING

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["status"] = self.status.value
        return d


@dataclass
class EvacuationRoute:
    """A road/waterway corridor linking an origin zone to a destination shelter."""

    route_id: str
    origin_zone_id: str
    destination_shelter_id: str
    distance_km: float
    road_capacity_vehicles_per_hour: int
    current_congestion_factor: float   # 1.0 = free-flow, >1.0 = congested
    passable: bool = True
    transport_modes: List[str] = field(default_factory=lambda: ["self_evacuate", "bus"])
    waypoints: List[Dict[str, float]] = field(default_factory=list)

    @property
    def effective_travel_time_hours(self) -> float:
        """Average travel time adjusted for congestion."""
        avg_speed_kmh = 40.0 / max(self.current_congestion_factor, 0.5)
        return (self.distance_km / avg_speed_kmh) * self.current_congestion_factor

    def to_dict(self) -> Dict[str, Any]:
        return {
            "route_id": self.route_id,
            "origin_zone_id": self.origin_zone_id,
            "destination_shelter_id": self.destination_shelter_id,
            "distance_km": round(self.distance_km, 2),
            "road_capacity_vehicles_per_hour": self.road_capacity_vehicles_per_hour,
            "current_congestion_factor": round(self.current_congestion_factor, 2),
            "effective_travel_time_hours": round(self.effective_travel_time_hours, 2),
            "passable": self.passable,
            "transport_modes": self.transport_modes,
        }


@dataclass
class ZoneEvacuationPlan:
    """Individual evacuation plan for a single zone."""

    zone_id: str
    zone_name: str
    population: int
    priority: int
    assigned_route_id: Optional[str]
    destination_shelter_id: Optional[str]
    estimated_vehicles_needed: int
    assisted_transport_required: int
    estimated_clearance_hours: float
    departure_wave: int   # Lower = departs sooner (1 = first wave)
    transport_modes: List[str]
    status: EvacuationStatus
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "zone_name": self.zone_name,
            "population": self.population,
            "priority": self.priority,
            "assigned_route_id": self.assigned_route_id,
            "destination_shelter_id": self.destination_shelter_id,
            "estimated_vehicles_needed": self.estimated_vehicles_needed,
            "assisted_transport_required": self.assisted_transport_required,
            "estimated_clearance_hours": round(self.estimated_clearance_hours, 2),
            "departure_wave": self.departure_wave,
            "transport_modes": self.transport_modes,
            "status": self.status.value,
            "warnings": self.warnings,
        }


@dataclass
class EvacuationPlan:
    """Master regional evacuation plan across all prioritized zones."""

    plan_id: str
    hazard_type: str
    region: str
    total_population_to_evacuate: int
    total_zones: int
    total_routes_available: int
    estimated_full_clearance_hours: float
    zone_plans: List[ZoneEvacuationPlan]
    critical_bottlenecks: List[str]
    special_assistance_total: int
    generated_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plan_id": self.plan_id,
            "hazard_type": self.hazard_type,
            "region": self.region,
            "total_population_to_evacuate": self.total_population_to_evacuate,
            "total_zones": self.total_zones,
            "total_routes_available": self.total_routes_available,
            "estimated_full_clearance_hours": round(self.estimated_full_clearance_hours, 2),
            "zone_plans": [zp.to_dict() for zp in self.zone_plans],
            "critical_bottlenecks": self.critical_bottlenecks,
            "special_assistance_total": self.special_assistance_total,
            "generated_at": self.generated_at,
        }


class EvacuationEngine:
    """
    Computes multi-zone evacuation plans with route assignments, wave sequencing,
    vehicle estimates, and special-needs accommodation.

    Example::

        engine = EvacuationEngine()
        plan = engine.generate_plan(
            hazard_type="flood",
            region="Brahmaputra Floodplain",
            zones=[...],
            routes=[...],
            shelter_capacities={...},
        )
    """

    def __init__(
        self,
        avg_persons_per_vehicle: int = 4,
        bus_capacity: int = 50,
        min_route_capacity_vehicles_per_hour: int = 50,
    ):
        self.avg_persons_per_vehicle = avg_persons_per_vehicle
        self.bus_capacity = bus_capacity
        self.min_route_capacity = min_route_capacity_vehicles_per_hour

    def _find_best_route(
        self,
        zone: EvacuationZone,
        routes: List[EvacuationRoute],
        shelter_capacities: Dict[str, int],
        already_allocated: Dict[str, int],
    ) -> Optional[EvacuationRoute]:
        """Select the best passable route with sufficient residual shelter capacity."""
        candidates = [
            r for r in routes
            if r.origin_zone_id == zone.zone_id and r.passable
        ]
        if not candidates:
            return None

        def route_score(r: EvacuationRoute) -> float:
            shelter_cap = shelter_capacities.get(r.destination_shelter_id, 0)
            used = already_allocated.get(r.destination_shelter_id, 0)
            residual = shelter_cap - used
            if residual < zone.population:
                return float("inf")  # Not enough capacity
            # Lower is better: prioritize shorter travel time and less congestion
            return r.effective_travel_time_hours + (r.current_congestion_factor - 1.0) * 2.0

        candidates.sort(key=route_score)
        best = candidates[0]
        # Reject if shelter capacity is insufficient
        cap = shelter_capacities.get(best.destination_shelter_id, 0)
        used = already_allocated.get(best.destination_shelter_id, 0)
        if cap - used < zone.population * 0.5:
            return None
        return best

    def _clearance_hours(
        self,
        zone: EvacuationZone,
        route: Optional[EvacuationRoute],
    ) -> float:
        """Estimate hours to fully clear a zone given population and route capacity."""
        if route is None:
            # No route: assume walking evacuation at 3 km/h for 10 km
            return 10.0 / 3.0

        vehicles_per_hour = route.road_capacity_vehicles_per_hour
        pax_per_hour = vehicles_per_hour * self.avg_persons_per_vehicle
        if pax_per_hour <= 0:
            return 24.0

        movement_hours = zone.population / pax_per_hour
        transit_time = route.effective_travel_time_hours
        return movement_hours + transit_time

    def generate_plan(
        self,
        hazard_type: str,
        region: str,
        zones: List[EvacuationZone],
        routes: List[EvacuationRoute],
        shelter_capacities: Optional[Dict[str, int]] = None,
        plan_id: Optional[str] = None,
    ) -> EvacuationPlan:
        """
        Generate a complete evacuation plan.

        Zones are sorted by priority (ascending, 1 = most urgent).
        Shelter allocation is tracked to prevent over-assignment.
        """
        import uuid
        pid = plan_id or f"evacplan-{uuid.uuid4().hex[:8]}"
        caps = shelter_capacities or {}
        allocated: Dict[str, int] = {}
        bottlenecks: List[str] = []
        zone_plans: List[ZoneEvacuationPlan] = []
        total_assisted = 0

        # Sort zones by priority ascending (1 = first), then by population descending
        sorted_zones = sorted(zones, key=lambda z: (z.priority, -z.population))

        # Assign departure waves (1 wave per priority tier)
        wave_map: Dict[int, int] = {}
        wave_counter = 1
        for z in sorted_zones:
            if z.priority not in wave_map:
                wave_map[z.priority] = wave_counter
                wave_counter += 1

        for z in sorted_zones:
            route = self._find_best_route(z, routes, caps, allocated)
            warnings: List[str] = []

            if route is None:
                warnings.append(
                    f"No viable route found for zone {z.zone_id}. "
                    "Consider helicopter or boat evacuation."
                )
                status = EvacuationStatus.BLOCKED
            else:
                allocated[route.destination_shelter_id] = (
                    allocated.get(route.destination_shelter_id, 0) + z.population
                )
                status = EvacuationStatus.PENDING

            clearance_hrs = self._clearance_hours(z, route)
            vehicles_needed = math.ceil(z.population / self.avg_persons_per_vehicle)
            assisted_count = z.special_needs_count + math.ceil(
                z.population * z.mobility_limited_pct
            )
            total_assisted += assisted_count

            if assisted_count > 0:
                bus_count = math.ceil(assisted_count / self.bus_capacity)
                warnings.append(
                    f"{assisted_count} residents require assisted transport "
                    f"({bus_count} buses / accessible vehicles)."
                )

            zone_plans.append(
                ZoneEvacuationPlan(
                    zone_id=z.zone_id,
                    zone_name=z.name,
                    population=z.population,
                    priority=z.priority,
                    assigned_route_id=route.route_id if route else None,
                    destination_shelter_id=route.destination_shelter_id if route else None,
                    estimated_vehicles_needed=vehicles_needed,
                    assisted_transport_required=assisted_count,
                    estimated_clearance_hours=clearance_hrs,
                    departure_wave=wave_map.get(z.priority, wave_counter),
                    transport_modes=route.transport_modes if route else ["walking", "helicopter"],
                    status=status,
                    warnings=warnings,
                )
            )

            if status == EvacuationStatus.BLOCKED:
                bottlenecks.append(f"Zone {z.name} ({z.zone_id}) has no passable route.")

        total_pop = sum(z.population for z in zones)
        max_clearance = max((zp.estimated_clearance_hours for zp in zone_plans), default=0.0)
        passable_routes = sum(1 for r in routes if r.passable)

        return EvacuationPlan(
            plan_id=pid,
            hazard_type=hazard_type,
            region=region,
            total_population_to_evacuate=total_pop,
            total_zones=len(zones),
            total_routes_available=passable_routes,
            estimated_full_clearance_hours=max_clearance,
            zone_plans=zone_plans,
            critical_bottlenecks=bottlenecks,
            special_assistance_total=total_assisted,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )

    def update_zone_status(
        self,
        plan: EvacuationPlan,
        zone_id: str,
        new_status: EvacuationStatus,
    ) -> bool:
        """Update a zone's evacuation status within an existing plan."""
        for zp in plan.zone_plans:
            if zp.zone_id == zone_id:
                zp.status = new_status
                return True
        return False
