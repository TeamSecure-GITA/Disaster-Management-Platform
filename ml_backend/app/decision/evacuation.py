"""
Evacuation decision service.
Coordinates evacuation corridor planning, departure sequencing, and transport capacity.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from app.decision_engine.evacuation_engine import (
    EvacuationEngine,
    EvacuationZone,
    EvacuationRoute,
    TransportMode,
    EvacuationStatus,
)


class EvacuationDecisionService:
    """High-level decision service orchestrating evacuation plans."""

    def __init__(self):
        self.engine = EvacuationEngine()

    def generate_plan(
        self,
        zones_data: List[Dict[str, Any]],
        routes_data: Optional[List[Dict[str, Any]]] = None,
        available_buses: int = 15,
        available_ambulances: int = 5,
    ) -> Dict[str, Any]:
        """Generates a complete prioritized evacuation order and route assignment."""
        zones = []
        for z in zones_data:
            zones.append(
                EvacuationZone(
                    zone_id=z.get("zone_id", f"zone_{len(zones)+1}"),
                    name=z.get("name", f"Zone {len(zones)+1}"),
                    population=int(z.get("population", 500)),
                    priority=int(z.get("priority", 2)),
                    latitude=float(z.get("latitude", 19.0)),
                    longitude=float(z.get("longitude", 72.8)),
                    special_needs_count=int(z.get("special_needs_count", 20)),
                    mobility_limited_pct=float(z.get("mobility_limited_pct", 0.05)),
                    status=EvacuationStatus(z.get("status", "pending")),
                )
            )

        routes = []
        if routes_data:
            for r in routes_data:
                origin_zone = r.get("origin_zone_id") or (zones[0].zone_id if zones else "zone_1")
                routes.append(
                    EvacuationRoute(
                        route_id=r.get("route_id", f"route_{len(routes)+1}"),
                        origin_zone_id=origin_zone,
                        destination_shelter_id=r.get("destination_shelter_id", "shelter_1"),
                        distance_km=float(r.get("distance_km", 10.0)),
                        road_capacity_vehicles_per_hour=int(r.get("road_capacity_vehicles_per_hour") or r.get("capacity_vehicles_per_hour", 800)),
                        current_congestion_factor=float(r.get("current_congestion_factor", 1.0)),
                        passable=bool(r.get("passable", r.get("is_active", True))),
                    )
                )

        plan = self.engine.generate_plan(
            hazard_type="general",
            region="Operational Area",
            zones=zones,
            routes=routes,
        )

        d = plan.to_dict()
        d["total_evacuees"] = d.get("total_population_to_evacuate", 0)
        d["orders"] = d.get("zone_plans", [])
        return d


evacuation_decision_service = EvacuationDecisionService()
