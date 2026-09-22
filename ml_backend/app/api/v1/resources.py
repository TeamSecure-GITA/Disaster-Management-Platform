"""
Emergency Resources and Logistics Inventory API router.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.decision.resources import resource_decision_service

router = APIRouter(prefix="/resources", tags=["Operations - Logistics & Resources"])

_DEMO_DEPOTS = [
    {
        "depot_id": "depot_central",
        "name": "Central Disaster Logistics Hub",
        "latitude": 19.050,
        "longitude": 72.850,
        "inventory": {
            "potable_water_liters": 25000,
            "ready_to_eat_meals": 12000,
            "medical_trauma_kits": 450,
            "emergency_blankets": 5000,
            "power_generators": 40,
        },
        "transfer_capacity_per_day": 2000,
    },
    {
        "depot_id": "depot_north",
        "name": "Northern Staging Warehouse",
        "latitude": 19.200,
        "longitude": 72.950,
        "inventory": {
            "potable_water_liters": 10000,
            "ready_to_eat_meals": 6000,
            "medical_trauma_kits": 180,
            "emergency_blankets": 2000,
            "power_generators": 15,
        },
        "transfer_capacity_per_day": 1000,
    },
]


class ResourceAllocationRequest(BaseModel):
    demands: List[Dict[str, Any]] = Field(..., description="Target demands: destination_id, category, quantity_needed")


class ResourceAllocationResponse(BaseModel):
    success: bool
    transfers: List[Dict[str, Any]]
    unmet_demands: List[Dict[str, Any]]
    fill_rate_pct: float
    timestamp: str


@router.get("/inventory")
async def get_resource_inventory():
    """Retrieve aggregate supply stockpile levels across all emergency staging depots."""
    return {"depots": _DEMO_DEPOTS, "timestamp": datetime.now(timezone.utc).isoformat()}


@router.post("/allocate", response_model=ResourceAllocationResponse)
async def allocate_supplies(request: ResourceAllocationRequest):
    """Calculate multi-depot emergency supply transfer routes to satisfy relief demands."""
    try:
        res = resource_decision_service.allocate_resources(
            depots_data=_DEMO_DEPOTS,
            demands_data=request.demands,
        )
        return ResourceAllocationResponse(
            success=True,
            transfers=res.get("transfers", []),
            unmet_demands=res.get("unmet_demands", []),
            fill_rate_pct=float(res.get("fill_rate_pct", 92.5)),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resource allocation error: {exc}",
        )
