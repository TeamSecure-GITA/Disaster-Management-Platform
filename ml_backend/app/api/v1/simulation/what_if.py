"""
What-if intervention analysis API routes.

Endpoints
---------
POST   /simulation/what-if/analyze    – Analyse a single intervention
POST   /simulation/what-if/compare    – Compare multiple interventions
GET    /simulation/what-if/health     – Engine health
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.simulation import SimulationService, get_simulation_service
from app.simulation.what_if import (
    AnalysisStatus,
    BaselineScenario,
    InterventionParameter,
    InterventionType,
    WhatIfScenario,
)


router = APIRouter(
    prefix="/what-if",
    tags=["simulation", "what-if"],
)


# ============================================================
# Request models
# ============================================================

class BaselineRequest(BaseModel):
    region:                         str   = "unknown"
    hazard_type:                    str   = "flood"
    intensity:                      float = Field(0.70, ge=0.0, le=1.0)
    population_at_risk:             int   = Field(50000, ge=0)
    area_sqkm:                      float = Field(100.0, gt=0.0)
    pre_warning_hours:              float = Field(6.0, ge=0.0)
    infrastructure_vulnerability:   float = Field(0.50, ge=0.0, le=1.0)
    resource_pre_positioning_score: float = Field(0.30, ge=0.0, le=1.0)


class InterventionParamRequest(BaseModel):
    name:  str
    value: float
    unit:  str = ""


class WhatIfRequest(BaseModel):
    scenario_id:       Optional[str]                    = None
    name:              str                              = "What-if scenario"
    intervention_type: str                              = "early_evacuation"
    baseline:          BaselineRequest
    parameters:        List[InterventionParamRequest]   = []
    description:       str                              = ""


def _build_whatif(req: WhatIfRequest) -> WhatIfScenario:
    try:
        itype = InterventionType(req.intervention_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Unknown intervention_type '{req.intervention_type}'. "
                f"Valid: {[t.value for t in InterventionType]}"
            ),
        )

    baseline = BaselineScenario(
        region=req.baseline.region,
        hazard_type=req.baseline.hazard_type,
        intensity=req.baseline.intensity,
        population_at_risk=req.baseline.population_at_risk,
        area_sqkm=req.baseline.area_sqkm,
        pre_warning_hours=req.baseline.pre_warning_hours,
        infrastructure_vulnerability=req.baseline.infrastructure_vulnerability,
        resource_pre_positioning_score=req.baseline.resource_pre_positioning_score,
    )

    params = [
        InterventionParameter(p.name, p.value, p.unit)
        for p in req.parameters
    ]

    return WhatIfScenario(
        scenario_id=req.scenario_id or "",
        name=req.name,
        intervention_type=itype,
        baseline=baseline,
        parameters=params,
        description=req.description,
    )


class CompareRequest(BaseModel):
    scenarios:     List[WhatIfRequest]
    comparison_id: Optional[str] = None


# ============================================================
# Routes
# ============================================================

@router.post(
    "/analyze",
    summary="Analyse a single what-if intervention",
    response_model=Dict[str, Any],
)
def analyze_intervention(
    req: WhatIfRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Compute casualty/displacement delta for one emergency intervention.
    """

    result = service.analyze_intervention(_build_whatif(req))
    return result.to_dict()


@router.post(
    "/compare",
    summary="Compare multiple what-if interventions",
    response_model=Dict[str, Any],
)
def compare_interventions(
    req: CompareRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Analyse up to 10 intervention scenarios and return a ranked comparison.
    """

    if len(req.scenarios) > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Maximum 10 scenarios per comparison request.",
        )

    scenarios = [_build_whatif(s) for s in req.scenarios]
    result = service.compare_interventions(scenarios, req.comparison_id)

    return result.to_dict()


@router.get(
    "/health",
    summary="What-if engine health",
    response_model=Dict[str, Any],
)
def health(
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    return service.what_if.health()
