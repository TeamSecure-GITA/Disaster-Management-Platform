"""
Emergency shelter intake and capacity balancing decision service.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.decision_engine.shelter_engine import (
    ShelterEngine,
    Shelter,
    ShelterStatus,
    ShelterType,
)


class ShelterDecisionService:
    """Service layer managing shelter admissions and overflow redirection."""

    def __init__(self):
        self.engine = ShelterEngine()

    def balance_shelter_load(
        self,
        shelters_data: List[Dict[str, Any]],
        incoming_populations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Assigns evacuee groups to shelters based on capacity and distance."""
        engine = ShelterEngine()

        facilities = []
        for s in shelters_data:
            stat_val = s.get("status", "open")
            stat_enum = ShelterStatus.OPEN if stat_val == "open" else ShelterStatus.CLOSED

            facility = Shelter(
                shelter_id=str(s.get("shelter_id", f"sh_{len(facilities)+1}")),
                name=str(s.get("name", "Emergency Shelter")),
                shelter_type=ShelterType.COMMUNITY_CENTER,
                latitude=float(s.get("latitude", 19.0)),
                longitude=float(s.get("longitude", 72.8)),
                total_capacity=int(s.get("total_capacity") or s.get("capacity", 500)),
                current_occupancy=int(s.get("current_occupancy", 0)),
                status=stat_enum,
                has_medical_unit=bool(s.get("has_medical_unit", s.get("has_medical", True))),
                has_generator=bool(s.get("has_generator", True)),
            )
            facilities.append(facility)

        engine.register_shelters(facilities)

        assignments = []
        unassigned_count = 0

        for grp in incoming_populations:
            gid = str(grp.get("group_id", f"grp_{len(assignments)+1}"))
            cnt = int(grp.get("count", 25))
            lat = float(grp.get("latitude", 19.0))
            lon = float(grp.get("longitude", 72.8))
            med = bool(grp.get("medical_required", False))

            res = engine.assign(
                origin_lat=lat,
                origin_lon=lon,
                persons=cnt,
                require_medical=med,
            )

            if res:
                assignments.append(res.to_dict())
            else:
                unassigned_count += cnt

        sys_status = engine.get_system_status()

        return {
            "assignments": assignments,
            "unassigned_count": unassigned_count,
            "system_status": sys_status.to_dict(),
        }


shelter_decision_service = ShelterDecisionService()
