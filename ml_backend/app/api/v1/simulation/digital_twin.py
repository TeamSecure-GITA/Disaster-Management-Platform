"""
Digital-twin scenario API routes.

Endpoints
---------
POST   /simulation/digital-twin/run          – Run a single scenario
POST   /simulation/digital-twin/batch        – Run multiple scenarios
GET    /simulation/digital-twin/status/{sid} – Poll run status
GET    /simulation/digital-twin/health       – Engine health check
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.simulation import SimulationService, get_simulation_service
from app.simulation.digital_twin import (
    ScenarioInput,
    ScenarioType,
    SimulationStatus,
)


router = APIRouter(
    prefix="/digital-twin",
    tags=["simulation", "digital-twin"],
)


# ============================================================
# Request / response models (Pydantic)
# ============================================================

class ScenarioRequest(BaseModel):
    scenario_type:              str   = Field("flood", description="Scenario type key")
    intensity:                  float = Field(0.70, ge=0.0, le=1.0)
    area_sqkm:                  float = Field(100.0, gt=0.0)
    population_at_risk:         int   = Field(50000, ge=0)
    infrastructure_fraction:    float = Field(0.40, ge=0.0, le=1.0)
    region:                     str   = Field("unknown")
    pre_warning_hours:          float = Field(12.0, ge=0.0)


class BatchScenarioRequest(BaseModel):
    scenarios: List[ScenarioRequest] = Field(..., min_length=1, max_length=20)
    batch_id:  Optional[str]         = None


def _parse_input(req: ScenarioRequest) -> ScenarioInput:
    try:
        stype = ScenarioType(req.scenario_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Unknown scenario_type '{req.scenario_type}'. "
                f"Valid: {[s.value for s in ScenarioType]}"
            ),
        )

    return ScenarioInput(
        scenario_type=stype,
        intensity=req.intensity,
        area_sqkm=req.area_sqkm,
        population_at_risk=req.population_at_risk,
        infrastructure_fraction=req.infrastructure_fraction,
        region=req.region,
        pre_warning_hours=req.pre_warning_hours,
    )


# ============================================================
# Routes
# ============================================================

@router.post(
    "/run",
    summary="Run a single digital-twin scenario",
    response_model=Dict[str, Any],
)
def run_scenario(
    req: ScenarioRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Execute a physics-based disaster scenario and return the full result.
    """

    result = service.run_digital_twin_scenario(_parse_input(req))
    return result.to_dict()


@router.post(
    "/batch",
    summary="Run multiple digital-twin scenarios",
    response_model=Dict[str, Any],
)
def run_batch(
    req: BatchScenarioRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Execute up to 20 scenarios in sequence and aggregate results.
    """

    inputs = [_parse_input(s) for s in req.scenarios]
    result = service.run_batch_scenarios(inputs, req.batch_id)

    return {
        "batch_id":                    result.batch_id,
        "total_scenarios":             result.total_scenarios,
        "successful":                  result.successful,
        "failed":                      result.failed,
        "total_estimated_casualties":  result.total_estimated_casualties,
        "total_economic_impact_usd":   result.total_economic_impact_usd,
        "highest_casualty_scenario_id": result.highest_casualty_scenario_id,
        "executed_at":                 result.executed_at,
        "results":                     [r.to_dict() for r in result.results],
    }


@router.get(
    "/status/{scenario_id}",
    summary="Poll scenario run status",
    response_model=Dict[str, Any],
)
def get_status(
    scenario_id: str,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Retrieve the lifecycle record for a previously submitted scenario.
    """

    record = service.digital_twin.registry.get(scenario_id)

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found.",
        )

    return record.to_dict()


@router.get(
    "/health",
    summary="Digital-twin engine health",
    response_model=Dict[str, Any],
)
def health(
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    return service.digital_twin.health()
