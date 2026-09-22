"""
Tactical Emergency Response & Dispatch Operations API router.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.decision.dispatch import dispatch_decision_service

router = APIRouter(prefix="/response", tags=["Operations - Emergency Response"])

_DEMO_RESPONDERS = [
    {"unit_id": "sar_01", "name": "National SAR Alpha", "unit_type": "search_and_rescue", "latitude": 19.070, "longitude": 72.870, "status": "available", "skills": ["water_rescue", "collapse_search"], "capacity": 6},
    {"unit_id": "med_01", "name": "EMS Rapid Medical 1", "unit_type": "medical_evacuation", "latitude": 19.080, "longitude": 72.880, "status": "available", "skills": ["triage", "advanced_life_support"], "capacity": 2},
    {"unit_id": "haz_01", "name": "Hazmat Control Unit", "unit_type": "hazmat", "latitude": 19.100, "longitude": 72.850, "status": "available", "skills": ["chemical_containment"], "capacity": 4},
]


class DispatchPlanRequest(BaseModel):
    incident_ids: List[str] = Field(default_factory=list, description="Target incidents to dispatch for")
    max_radius_km: float = Field(35.0, description="Maximum response distance (km)")


class DispatchPlanResponse(BaseModel):
    success: bool
    plan_id: str
    assignments: List[Dict[str, Any]]
    unassigned_incidents: List[str]
    total_travel_time_est_minutes: float
    timestamp: str


@router.post("/optimize-dispatch", response_model=DispatchPlanResponse)
async def optimize_response_dispatch(request: DispatchPlanRequest):
    """Generate optimal automated responder unit assignments for pending incidents."""
    try:
        incidents = [
            {"incident_id": inc_id, "hazard_type": "flood", "severity": 4, "latitude": 19.076, "longitude": 72.877, "required_skills": ["water_rescue"], "casualty_count": 2}
            for inc_id in (request.incident_ids or ["inc_001"])
        ]
        result = dispatch_decision_service.optimize_dispatch(
            incidents=incidents,
            responders=_DEMO_RESPONDERS,
            max_response_radius_km=request.max_radius_km,
        )

        return DispatchPlanResponse(
            success=True,
            plan_id=f"plan_{uuid.uuid4().hex[:8]}",
            assignments=result.get("assignments", []),
            unassigned_incidents=result.get("unassigned_calls", []),
            total_travel_time_est_minutes=float(result.get("total_response_time_minutes", 18.5)),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Response dispatch optimization error: {exc}",
        )


@router.get("/units")
async def list_responder_units():
    """List registered emergency responder units and current availability."""
    return {"units": _DEMO_RESPONDERS, "total": len(_DEMO_RESPONDERS)}
