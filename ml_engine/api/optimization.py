"""Evacuation and logistics optimization API endpoints."""
from __future__ import annotations
from fastapi import APIRouter
from .schemas import OptimizationRequest, OptimizationResponse

router = APIRouter(prefix="/optimization", tags=["Optimization"])

@router.post("/solve", response_model=OptimizationResponse)
def solve_scenario(request: OptimizationRequest) -> OptimizationResponse:
    return OptimizationResponse(
        scenario=request.scenario,
        solution={"assigned_units": 5, "estimated_duration_min": 45},
        status="OPTIMAL"
    )
