"""
Emergency responder dispatch decision service.
Matches emergency incident triage with optimal responder unit assignments.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.decision_engine.dispatch_engine import (
    DispatchEngine,
    ResponseUnit,
    IncidentReport,
    UnitType,
    UnitAvailabilityStatus,
    IncidentSeverity,
)


class DispatchDecisionService:
    """Service layer for emergency responder unit dispatch decisions."""

    def __init__(self):
        self.engine = DispatchEngine()

    def optimize_dispatch(
        self,
        incidents: List[Dict[str, Any]],
        responders: List[Dict[str, Any]],
        max_response_radius_km: float = 50.0,
    ) -> Dict[str, Any]:
        """Calculates closest, best-matched responder assignments for incidents."""
        engine = DispatchEngine(max_dispatch_radius_km=max_response_radius_km)

        units = []
        for r in responders:
            stat_val = r.get("status", "available")
            try:
                stat_enum = UnitAvailabilityStatus(stat_val)
            except ValueError:
                stat_enum = UnitAvailabilityStatus.AVAILABLE

            type_val = r.get("unit_type", "search_and_rescue")
            try:
                type_enum = UnitType(type_val)
            except ValueError:
                type_enum = UnitType.SEARCH_AND_RESCUE

            unit = ResponseUnit(
                unit_id=str(r.get("responder_id") or r.get("unit_id", f"unit_{len(units)+1}")),
                unit_type=type_enum,
                callsign=str(r.get("name") or r.get("callsign", "Emergency Unit")),
                latitude=float(r.get("latitude", 19.0)),
                longitude=float(r.get("longitude", 72.8)),
                capacity=int(r.get("capacity", 4)),
                specialties=list(r.get("skills", ["first_aid"])),
                status=stat_enum,
            )
            units.append(unit)

        engine.register_units(units)

        incident_reports = []
        for inc in incidents:
            sev_int = int(inc.get("severity", 3))
            sev_enum = (
                IncidentSeverity.CRITICAL if sev_int >= 5
                else IncidentSeverity.MAJOR if sev_int >= 4
                else IncidentSeverity.MODERATE if sev_int >= 3
                else IncidentSeverity.MINOR
            )

            report = IncidentReport(
                incident_id=str(inc.get("incident_id") or inc.get("call_id", f"inc_{len(incident_reports)+1}")),
                title=str(inc.get("title", "Emergency Incident")),
                incident_type=str(inc.get("hazard_type", "general")),
                severity=sev_enum,
                latitude=float(inc.get("latitude", 19.0)),
                longitude=float(inc.get("longitude", 72.8)),
                region=str(inc.get("region", "Region-1")),
                persons_affected=int(inc.get("casualty_count", inc.get("persons_affected", 0))),
            )
            incident_reports.append(report)

        dispatch_plan = engine.dispatch_all(incident_reports)
        res = dispatch_plan.to_dict()
        res["assignments"] = res.get("orders", [])
        return res


dispatch_decision_service = DispatchDecisionService()
