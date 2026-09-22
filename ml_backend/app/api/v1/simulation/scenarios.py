"""
Combined simulation scenarios API routes.

Provides unified endpoints for:
    - Evacuation simulation
    - Multi-hazard cascade simulation
    - Population dynamics simulation
    - Displacement projection (lightweight)
    - Overall simulation service health

Endpoints
---------
POST   /simulation/scenarios/evacuation            – Evacuation sim
POST   /simulation/scenarios/cascade               – Multi-hazard cascade
POST   /simulation/scenarios/population            – Population dynamics
POST   /simulation/scenarios/displacement-project  – Quick displacement projection
GET    /simulation/scenarios/health                – Service health
GET    /simulation/scenarios/registry              – Registry summary
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.simulation import SimulationService, get_simulation_service
from app.simulation.evacuation import EvacSimConfig, SimCorridor, SimZone
from app.simulation.multi_hazard import CascadeSimConfig, HazardEvent, PrimaryHazard
from app.simulation.population import ExposureZone, PopulationSimConfig
from app.simulation.population.exposure import DemographicBreakdown


router = APIRouter(
    prefix="/scenarios",
    tags=["simulation", "scenarios"],
)


# ============================================================
# Evacuation request models
# ============================================================

class SimZoneRequest(BaseModel):
    zone_id:              str
    name:                 str   = ""
    population:           int   = Field(0, ge=0)
    priority:             int   = Field(1, ge=1, le=10)
    corridor_ids:         List[str] = []
    special_needs_count:  int   = 0


class SimCorridorRequest(BaseModel):
    corridor_id:              str
    name:                     str   = ""
    throughput_per_hour:      int   = Field(1000, gt=0)
    length_km:                float = Field(10.0, gt=0.0)
    passable:                 bool  = True


class EvacuationRequest(BaseModel):
    zones:                          List[SimZoneRequest]
    corridors:                      List[SimCorridorRequest]
    total_population:               int   = Field(10000, ge=0)
    time_step_minutes:              int   = Field(30, ge=5, le=120)
    max_steps:                      int   = Field(96, ge=1, le=288)
    enable_anti_herd:               bool  = True
    special_needs_priority_ratio:   float = Field(0.15, ge=0.0, le=0.50)
    simulation_id:                  Optional[str] = None


# ============================================================
# Cascade request models
# ============================================================

class HazardEventRequest(BaseModel):
    event_id:           Optional[str] = None
    hazard_type:        str   = "flood"
    intensity:          float = Field(0.70, ge=0.0, le=1.0)
    region:             str   = "unknown"
    area_sqkm:          float = Field(100.0, gt=0.0)
    population_exposed: int   = Field(10000, ge=0)
    onset_hour:         float = 0.0
    duration_hours:     float = 24.0


class CascadeRequest(BaseModel):
    primary_events:               List[HazardEventRequest]
    region:                       str   = "unknown"
    simulation_hours:             float = Field(48.0, gt=0.0, le=720.0)
    time_step_hours:              float = Field(1.0, ge=0.25, le=24.0)
    max_cascade_depth:            int   = Field(3, ge=1, le=5)
    enable_compound_amplification: bool = True
    simulation_id:                Optional[str] = None


# ============================================================
# Population request models
# ============================================================

class PopulationRequest(BaseModel):
    region:           str   = "unknown"
    hazard_type:      str   = "flood"
    hazard_intensity: float = Field(0.70, ge=0.0, le=1.0)
    total_population: int   = Field(50000, ge=0)
    area_sqkm:        float = Field(100.0, gt=0.0)
    simulation_days:  int   = Field(30, ge=1, le=180)
    time_step_days:   float = Field(1.0, ge=0.25, le=7.0)
    simulation_id:    Optional[str] = None


class DisplacementProjectRequest(BaseModel):
    total_population: int   = Field(..., ge=0)
    hazard_intensity: float = Field(..., ge=0.0, le=1.0)
    days:             int   = Field(30, ge=1, le=365)


# ============================================================
# Routes — Evacuation
# ============================================================

@router.post(
    "/evacuation",
    summary="Run evacuation discrete-event simulation",
    response_model=Dict[str, Any],
)
def run_evacuation(
    req: EvacuationRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Simulate population evacuation through a corridor network.
    """

    zones = [
        SimZone(
            zone_id=z.zone_id,
            name=z.name,
            population=z.population,
            priority=z.priority,
            corridor_ids=z.corridor_ids,
            special_needs_count=z.special_needs_count,
        )
        for z in req.zones
    ]

    corridors = [
        SimCorridor(
            corridor_id=c.corridor_id,
            name=c.name,
            throughput_per_hour=c.throughput_per_hour,
            length_km=c.length_km,
            passable=c.passable,
        )
        for c in req.corridors
    ]

    config = EvacSimConfig(
        zones=zones,
        corridors=corridors,
        total_population=req.total_population,
        time_step_minutes=req.time_step_minutes,
        max_steps=req.max_steps,
        enable_anti_herd=req.enable_anti_herd,
        special_needs_priority_ratio=req.special_needs_priority_ratio,
    )

    result = service.run_evacuation_simulation(config, req.simulation_id)
    return result.to_dict()


# ============================================================
# Routes — Multi-hazard cascade
# ============================================================

@router.post(
    "/cascade",
    summary="Run multi-hazard cascade simulation",
    response_model=Dict[str, Any],
)
def run_cascade(
    req: CascadeRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Model cascade propagation from primary hazard events.
    """

    import uuid

    events: List[HazardEvent] = []

    for i, e in enumerate(req.primary_events):
        try:
            htype = PrimaryHazard(e.hazard_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Unknown hazard_type '{e.hazard_type}'. "
                    f"Valid: {[h.value for h in PrimaryHazard]}"
                ),
            )

        events.append(HazardEvent(
            event_id=e.event_id or f"evt-{i+1}-{uuid.uuid4().hex[:6]}",
            hazard_type=htype,
            intensity=e.intensity,
            region=e.region,
            area_sqkm=e.area_sqkm,
            population_exposed=e.population_exposed,
            onset_hour=e.onset_hour,
            duration_hours=e.duration_hours,
        ))

    config = CascadeSimConfig(
        primary_events=events,
        region=req.region,
        simulation_hours=req.simulation_hours,
        time_step_hours=req.time_step_hours,
        max_cascade_depth=req.max_cascade_depth,
        enable_compound_amplification=req.enable_compound_amplification,
    )

    result = service.run_cascade(config, req.simulation_id)
    return result.to_dict()


# ============================================================
# Routes — Population dynamics
# ============================================================

@router.post(
    "/population",
    summary="Run population dynamics simulation",
    response_model=Dict[str, Any],
)
def run_population(
    req: PopulationRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Model three-phase disaster population evolution over time.
    """

    # Build a single representative zone from the flat request.
    zone = ExposureZone(
        zone_id="zone-1",
        name=req.region,
        latitude=0.0,
        longitude=0.0,
        area_sqkm=req.area_sqkm,
        demographics=DemographicBreakdown(total=req.total_population),
        hazard_intensity=req.hazard_intensity,
    )

    config = PopulationSimConfig(
        zones=[zone],
        hazard_intensity=req.hazard_intensity,
        hazard_type=req.hazard_type,
        simulation_days=req.simulation_days,
        time_step_days=req.time_step_days,
        region=req.region,
    )

    result = service.run_population_sim(config, req.simulation_id)
    return result.to_dict()


@router.post(
    "/displacement-project",
    summary="Lightweight displacement projection",
    response_model=Dict[str, Any],
)
def project_displacement(
    req: DisplacementProjectRequest,
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    """
    Fast exponential-recovery displacement projection without full zone data.
    """

    timeline = service.project_displacement(
        total_population=req.total_population,
        hazard_intensity=req.hazard_intensity,
        days=req.days,
    )

    return {
        "total_population": req.total_population,
        "hazard_intensity": req.hazard_intensity,
        "projection_days": req.days,
        "timeline": timeline,
    }


# ============================================================
# Health & registry
# ============================================================

@router.get(
    "/health",
    summary="Simulation service health",
    response_model=Dict[str, Any],
)
def health(
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    return service.health()


@router.get(
    "/registry",
    summary="Scenario registry summary",
    response_model=Dict[str, Any],
)
def registry_summary(
    service: SimulationService = Depends(get_simulation_service),
) -> Dict[str, Any]:
    return service.registry_summary()
