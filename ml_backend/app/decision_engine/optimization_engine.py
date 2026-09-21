"""
Multi-objective optimization engine for disaster resource deployment.

Solves joint allocation, routing, and scheduling decisions across multiple
competing objectives: minimizing response time, maximizing lives saved,
minimizing resource depletion cost, and ensuring equitable distribution.

Uses greedy approximations and priority-weighted scoring suitable for
real-time operational use without heavy solver dependencies.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class OptimizationObjective(str, Enum):
    MINIMIZE_RESPONSE_TIME = "minimize_response_time"
    MAXIMIZE_LIVES_SAVED = "maximize_lives_saved"
    MINIMIZE_COST = "minimize_cost"
    MAXIMIZE_EQUITY = "maximize_equity"
    BALANCED = "balanced"           # Weighted combination of all objectives


@dataclass
class AllocationTarget:
    """
    A demand node requiring resource allocation (zone, camp, or incident site).
    """
    target_id: str
    name: str
    latitude: float
    longitude: float
    population: int
    urgency_score: float      # 0.0 – 1.0, derived from risk engine composite score
    accessibility_index: float = 1.0  # 1.0 = fully accessible, 0.0 = inaccessible
    medical_need_pct: float = 0.0     # Fraction requiring medical intervention
    children_pct: float = 0.0
    elderly_pct: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ResourceDepot:
    """
    A supply depot or staging area from which resources can be dispatched.
    """
    depot_id: str
    name: str
    latitude: float
    longitude: float
    available_units: int          # Generic units available (personnel, packs, etc.)
    transport_capacity_per_trip: int
    vehicle_count: int = 1
    transport_speed_kmh: float = 60.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AllocationResult:
    """Single resolved depot → target allocation."""

    depot_id: str
    target_id: str
    target_name: str
    units_allocated: int
    distance_km: float
    estimated_delivery_hours: float
    trips_required: int
    priority_score: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class OptimizationSolution:
    """Complete multi-objective optimization result."""

    solution_id: str
    objective: OptimizationObjective
    total_targets: int
    total_depots: int
    allocations: List[AllocationResult]
    unserved_targets: List[str]
    total_units_deployed: int
    estimated_coverage_pct: float
    overall_response_time_hours: float
    equity_score: float             # Gini-like uniformity of coverage (0=unequal, 1=uniform)
    feasibility_notes: List[str]
    solved_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "solution_id": self.solution_id,
            "objective": self.objective.value,
            "total_targets": self.total_targets,
            "total_depots": self.total_depots,
            "allocations": [a.to_dict() for a in self.allocations],
            "unserved_targets": self.unserved_targets,
            "total_units_deployed": self.total_units_deployed,
            "estimated_coverage_pct": round(self.estimated_coverage_pct, 2),
            "overall_response_time_hours": round(self.overall_response_time_hours, 2),
            "equity_score": round(self.equity_score, 3),
            "feasibility_notes": self.feasibility_notes,
            "solved_at": self.solved_at,
        }


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    return earth_r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _gini_coefficient(values: List[float]) -> float:
    """
    Compute Gini coefficient of coverage distribution.
    0.0 = perfectly equal, 1.0 = maximally unequal.
    Returns 1.0 - gini so that higher = more equitable.
    """
    if not values or all(v == 0 for v in values):
        return 0.0
    n = len(values)
    sorted_vals = sorted(values)
    cumsum = sum((i + 1) * v for i, v in enumerate(sorted_vals))
    total = sum(sorted_vals)
    if total == 0:
        return 0.0
    gini = (2 * cumsum) / (n * total) - (n + 1) / n
    return round(1.0 - gini, 3)  # Invert: higher = more equitable


def _target_priority_score(
    target: AllocationTarget,
    objective: OptimizationObjective,
    distance_km: float,
) -> float:
    """Compute a composite prioritization score for allocating to a target from a depot."""
    urgency_w = 0.35
    population_w = 0.30
    access_w = 0.15
    proximity_w = 0.15
    vulnerability_w = 0.05

    # Normalize population (soft cap at 100K)
    pop_norm = min(target.population / 100_000.0, 1.0)
    # Proximity: closer = higher score (inverse of distance)
    prox_norm = max(0.0, 1.0 - distance_km / 500.0)
    # Vulnerability: children + elderly fraction
    vuln = min(target.children_pct + target.elderly_pct, 1.0)

    base = (
        urgency_w * target.urgency_score
        + population_w * pop_norm
        + access_w * target.accessibility_index
        + proximity_w * prox_norm
        + vulnerability_w * vuln
    )

    # Objective-specific multipliers
    if objective == OptimizationObjective.MINIMIZE_RESPONSE_TIME:
        return base * (1.0 + prox_norm * 0.5)
    if objective == OptimizationObjective.MAXIMIZE_LIVES_SAVED:
        return base * (1.0 + target.urgency_score * 0.5 + vuln * 0.3)
    if objective == OptimizationObjective.MAXIMIZE_EQUITY:
        return base * (1.0 + (1.0 - target.accessibility_index) * 0.5)
    if objective == OptimizationObjective.MINIMIZE_COST:
        return base * prox_norm  # Heavily weight proximity to reduce transport cost
    return base  # BALANCED


class OptimizationEngine:
    """
    Priority-weighted greedy solver for multi-objective disaster resource allocation.

    Supports five optimization objectives:
    - minimize_response_time
    - maximize_lives_saved
    - minimize_cost
    - maximize_equity
    - balanced (default)

    Example::

        engine = OptimizationEngine()
        solution = engine.solve(
            targets=[...],
            depots=[...],
            objective=OptimizationObjective.BALANCED,
        )
    """

    def __init__(self, max_distance_km: float = 300.0):
        self.max_distance_km = max_distance_km

    def _nearest_depot(
        self,
        target: AllocationTarget,
        depots: List[ResourceDepot],
        remaining_units: Dict[str, int],
    ) -> Optional[Tuple[ResourceDepot, float]]:
        """Return the closest depot with available units."""
        candidates = [
            (d, _haversine_km(target.latitude, target.longitude, d.latitude, d.longitude))
            for d in depots
            if remaining_units.get(d.depot_id, 0) > 0
        ]
        if not candidates:
            return None
        candidates.sort(key=lambda x: x[1])
        return candidates[0]

    def solve(
        self,
        targets: List[AllocationTarget],
        depots: List[ResourceDepot],
        objective: OptimizationObjective = OptimizationObjective.BALANCED,
        units_per_target_base: int = 100,
        solution_id: Optional[str] = None,
    ) -> OptimizationSolution:
        """
        Compute a priority-ranked resource allocation across all targets and depots.
        """
        import uuid

        sid = solution_id or f"opt-{uuid.uuid4().hex[:8]}"
        remaining_units: Dict[str, int] = {
            d.depot_id: d.available_units for d in depots
        }

        allocations: List[AllocationResult] = []
        unserved: List[str] = []
        notes: List[str] = []
        coverage_values: List[float] = []

        # Score targets under given objective
        scored_targets: List[Tuple[float, AllocationTarget]] = []
        for t in targets:
            depot_result = self._nearest_depot(t, depots, remaining_units)
            dist = depot_result[1] if depot_result else self.max_distance_km
            score = _target_priority_score(t, objective, dist)
            scored_targets.append((score, t))

        scored_targets.sort(key=lambda x: -x[0])  # Descending priority

        total_demanded = len(targets) * units_per_target_base
        total_deployed = 0

        for priority_score, target in scored_targets:
            depot_result = self._nearest_depot(target, depots, remaining_units)

            if depot_result is None:
                unserved.append(target.target_id)
                coverage_values.append(0.0)
                notes.append(
                    f"Target {target.name} unserved — all depots exhausted."
                )
                continue

            depot, dist_km = depot_result

            if dist_km > self.max_distance_km:
                unserved.append(target.target_id)
                coverage_values.append(0.0)
                notes.append(
                    f"Target {target.name} exceeds max radius ({dist_km:.1f} km)."
                )
                continue

            # Allocate proportional to urgency and population
            demand = units_per_target_base + int(
                target.urgency_score * units_per_target_base * 0.5
                + (target.population / 10_000) * 10
            )
            available = remaining_units[depot.depot_id]
            units = min(demand, available)

            if units <= 0:
                unserved.append(target.target_id)
                coverage_values.append(0.0)
                continue

            remaining_units[depot.depot_id] -= units
            total_deployed += units

            trips = math.ceil(units / max(depot.transport_capacity_per_trip, 1))
            speed = max(depot.transport_speed_kmh, 10.0)
            eta = (dist_km / speed) * (1.0 + 0.1 * (trips - 1))  # Multi-trip overhead

            coverage_pct = min(units / max(demand, 1), 1.0)
            coverage_values.append(coverage_pct)

            allocations.append(AllocationResult(
                depot_id=depot.depot_id,
                target_id=target.target_id,
                target_name=target.name,
                units_allocated=units,
                distance_km=round(dist_km, 2),
                estimated_delivery_hours=round(eta, 2),
                trips_required=trips,
                priority_score=round(priority_score, 3),
            ))

        all_eta = [a.estimated_delivery_hours for a in allocations]
        overall_eta = max(all_eta) if all_eta else 0.0
        coverage_pct = (len(allocations) / max(len(targets), 1)) * 100.0
        equity = _gini_coefficient(coverage_values)

        return OptimizationSolution(
            solution_id=sid,
            objective=objective,
            total_targets=len(targets),
            total_depots=len(depots),
            allocations=allocations,
            unserved_targets=unserved,
            total_units_deployed=total_deployed,
            estimated_coverage_pct=round(coverage_pct, 2),
            overall_response_time_hours=overall_eta,
            equity_score=equity,
            feasibility_notes=notes,
            solved_at=datetime.now(timezone.utc).isoformat(),
        )

    def reoptimize_with_constraint(
        self,
        targets: List[AllocationTarget],
        depots: List[ResourceDepot],
        max_response_hours: float,
        objective: OptimizationObjective = OptimizationObjective.BALANCED,
    ) -> OptimizationSolution:
        """
        Re-run optimization excluding depot–target pairs that exceed a travel time constraint.
        """
        filtered_depots: Dict[str, ResourceDepot] = {}
        for t in targets:
            for d in depots:
                dist = _haversine_km(t.latitude, t.longitude, d.latitude, d.longitude)
                eta = dist / max(d.transport_speed_kmh, 10.0)
                if eta <= max_response_hours:
                    filtered_depots[d.depot_id] = d

        return self.solve(
            targets=targets,
            depots=list(filtered_depots.values()),
            objective=objective,
        )

    def sensitivity_analysis(
        self,
        targets: List[AllocationTarget],
        depots: List[ResourceDepot],
    ) -> List[Dict[str, Any]]:
        """
        Run all objectives and return comparative summary.
        Useful for EOC planning boards to compare trade-offs.
        """
        results = []
        for obj in OptimizationObjective:
            sol = self.solve(targets=targets, depots=depots, objective=obj)
            results.append({
                "objective": obj.value,
                "coverage_pct": sol.estimated_coverage_pct,
                "response_time_hours": sol.overall_response_time_hours,
                "equity_score": sol.equity_score,
                "units_deployed": sol.total_units_deployed,
                "unserved_count": len(sol.unserved_targets),
            })
        return results
