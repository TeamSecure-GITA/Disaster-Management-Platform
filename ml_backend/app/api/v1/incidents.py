"""
Incident Management and Field Observations API router.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.decision.priority import priority_decision_service

router = APIRouter(prefix="/incidents", tags=["Operations - Incidents"])

# In-memory mock store backed by priority service and ready for DB
_IN_MEMORY_INCIDENTS: Dict[str, Dict[str, Any]] = {
    "inc_001": {
        "incident_id": "inc_001",
        "title": "Flash Flooding in Low-lying Sector 4",
        "hazard_type": "flood",
        "severity": 4,
        "status": "in_progress",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "casualty_count": 2,
        "critical_infrastructure_threatened": True,
        "population_vulnerability": 0.75,
        "description": "Rapid inundation exceeding 1.2 meters near school complex.",
        "reported_at": "2026-09-22T10:15:00Z",
        "updated_at": "2026-09-22T12:00:00Z",
    },
    "inc_002": {
        "incident_id": "inc_002",
        "title": "Debris Flow on Ridge Highway",
        "hazard_type": "landslide",
        "severity": 3,
        "status": "reported",
        "latitude": 19.1200,
        "longitude": 72.9100,
        "casualty_count": 0,
        "critical_infrastructure_threatened": False,
        "population_vulnerability": 0.40,
        "description": "Partial slope slippage blocking northbound lane.",
        "reported_at": "2026-09-22T11:30:00Z",
        "updated_at": "2026-09-22T11:30:00Z",
    },
}


class IncidentCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, description="Incident title")
    hazard_type: str = Field("flood", description="Hazard category (flood, landslide, fire, etc.)")
    severity: int = Field(3, ge=1, le=5, description="Severity rating 1 (minor) to 5 (catastrophic)")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    casualty_count: int = Field(0, ge=0, description="Reported injuries / trapped persons")
    critical_infrastructure_threatened: bool = Field(False, description="Hospitals, bridges, power grid at risk")
    description: Optional[str] = Field("", description="Detailed observation notes")


class IncidentResponse(BaseModel):
    incident_id: str
    title: str
    hazard_type: str
    severity: int
    status: str
    latitude: float
    longitude: float
    casualty_count: int
    critical_infrastructure_threatened: bool
    priority_score: Optional[float] = None
    priority_level: Optional[str] = None
    triage_rank: Optional[int] = None
    description: str
    reported_at: str
    updated_at: str


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    status_filter: Optional[str] = Query(None, description="Filter by status (reported, in_progress, resolved)"),
    hazard_type: Optional[str] = Query(None, description="Filter by hazard type"),
):
    """Retrieve all emergency disaster incidents, prioritized by multi-criteria severity rank."""
    incidents = list(_IN_MEMORY_INCIDENTS.values())
    if status_filter:
        incidents = [i for i in incidents if i.get("status") == status_filter]
    if hazard_type:
        incidents = [i for i in incidents if i.get("hazard_type") == hazard_type]

    ranked = priority_decision_service.rank_incidents_by_priority(incidents)
    return ranked


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(request: IncidentCreateRequest):
    """Register a new ground hazard or emergency incident report and compute initial triage rank."""
    inc_id = f"inc_{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    data = {
        "incident_id": inc_id,
        "title": request.title,
        "hazard_type": request.hazard_type,
        "severity": request.severity,
        "status": "reported",
        "latitude": request.latitude,
        "longitude": request.longitude,
        "casualty_count": request.casualty_count,
        "critical_infrastructure_threatened": request.critical_infrastructure_threatened,
        "population_vulnerability": 0.6,
        "description": request.description or "",
        "reported_at": now,
        "updated_at": now,
    }
    _IN_MEMORY_INCIDENTS[inc_id] = data
    ranked = priority_decision_service.rank_incidents_by_priority([data])
    return ranked[0]


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    """Retrieve a single incident by ID."""
    inc = _IN_MEMORY_INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    ranked = priority_decision_service.rank_incidents_by_priority([inc])
    return ranked[0]


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(incident_id: str, new_status: str = Query(..., description="in_progress, contained, resolved")):
    """Update operational workflow status of an incident."""
    inc = _IN_MEMORY_INCIDENTS.get(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc["status"] = new_status
    inc["updated_at"] = datetime.now(timezone.utc).isoformat()
    ranked = priority_decision_service.rank_incidents_by_priority([inc])
    return ranked[0]
