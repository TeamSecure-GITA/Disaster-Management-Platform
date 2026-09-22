"""
Emergency Shelters Management and Intake Balancing API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.decision.shelters import shelter_decision_service

router = APIRouter(prefix="/shelters", tags=["Operations - Shelters"])

_DEMO_SHELTERS = [
    {"shelter_id": "sh_01", "name": "Community Civic Center", "capacity": 800, "current_occupancy": 520, "latitude": 19.060, "longitude": 72.860, "status": "open", "has_medical": True, "has_generator": True},
    {"shelter_id": "sh_02", "name": "North High School Gymnasium", "capacity": 600, "current_occupancy": 410, "latitude": 19.090, "longitude": 72.890, "status": "open", "has_medical": True, "has_generator": True},
    {"shelter_id": "sh_03", "name": "Eastern Sports Complex", "capacity": 1200, "current_occupancy": 300, "latitude": 19.110, "longitude": 72.920, "status": "open", "has_medical": True, "has_generator": True},
]


class ShelterIntakeRequest(BaseModel):
    incoming_groups: List[Dict[str, Any]] = Field(..., description="Groups needing shelter: group_id, count, latitude, longitude, medical_required")


class ShelterIntakeResponse(BaseModel):
    success: bool
    assignments: List[Dict[str, Any]]
    unassigned_count: int
    updated_shelter_occupancies: List[Dict[str, Any]]
    timestamp: str


@router.get("", response_model=List[Dict[str, Any]])
async def list_shelters():
    """Retrieve all designated emergency evacuation shelters and real-time occupancy statistics."""
    for s in _DEMO_SHELTERS:
        s["utilization_pct"] = round((s["current_occupancy"] / max(1, s["capacity"])) * 100.0, 1)
    return _DEMO_SHELTERS


@router.post("/balance-intake", response_model=ShelterIntakeResponse)
async def balance_shelter_intake(request: ShelterIntakeRequest):
    """Assign incoming displaced population groups to optimal shelters without exceeding safe capacity."""
    try:
        res = shelter_decision_service.balance_shelter_load(
            shelters_data=_DEMO_SHELTERS,
            incoming_populations=request.incoming_groups,
        )
        return ShelterIntakeResponse(
            success=True,
            assignments=res.get("assignments", []),
            unassigned_count=int(res.get("unassigned_count", 0)),
            updated_shelter_occupancies=_DEMO_SHELTERS,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Shelter balancing error: {exc}",
        )
