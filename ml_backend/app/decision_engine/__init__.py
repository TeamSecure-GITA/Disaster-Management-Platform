"""
Decision Engine — unified facade.

Provides a single entry point (DecisionService) that wires together the
risk, evacuation, resource, dispatch, shelter, and optimization engines.

Usage::

    from app.decision_engine import DecisionService

    svc = DecisionService()
    risk_summary = svc.risk.assess_multi_hazard("Assam", hazards=[...])
    evac_plan   = svc.evacuation.generate_plan(...)
    alloc       = svc.resources.allocate(request)
    dispatch_pl = svc.dispatch.dispatch_all(incidents)
    shelter_asg = svc.shelter.assign(lat, lon, persons=500)
    opt_sol     = svc.optimizer.solve(targets, depots)
"""

from __future__ import annotations

from .dispatch_engine import (
    DispatchEngine,
    DispatchOrder,
    DispatchPlan,
    IncidentReport,
    IncidentSeverity,
    ResponseUnit,
    UnitAvailabilityStatus,
    UnitType,
)
from .evacuation_engine import (
    EvacuationEngine,
    EvacuationPlan,
    EvacuationRoute,
    EvacuationStatus,
    EvacuationZone,
    TransportMode,
    ZoneEvacuationPlan,
)
from .optimization_engine import (
    AllocationResult,
    AllocationTarget,
    OptimizationEngine,
    OptimizationObjective,
    OptimizationSolution,
    ResourceDepot,
)
from .resource_engine import (
    AllocationDecision,
    InventorySnapshot,
    ResourceCategory,
    ResourceEngine,
    ResourceItem,
    ResourceRequest,
    ResourceStatus,
)
from .risk_engine import (
    HazardInput,
    HazardType,
    MultiHazardRiskSummary,
    RiskAssessment,
    RiskEngine,
    RiskLevel,
)
from .shelter_engine import (
    Shelter,
    ShelterAssignment,
    ShelterEngine,
    ShelterStatus,
    ShelterSystemStatus,
    ShelterType,
)


class DecisionService:
    """
    Unified facade for all decision-support engines.

    Instantiate once at application startup and inject into
    API route handlers or AI tool integrations.

    Example::

        service = DecisionService()

        # Risk evaluation
        summary = service.risk.assess_multi_hazard("Assam", hazards)

        # Evacuation planning
        plan = service.evacuation.generate_plan(
            hazard_type="flood",
            region="Brahmaputra Valley",
            zones=zones,
            routes=routes,
            shelter_capacities=capacities,
        )

        # Resource allocation
        decision = service.resources.allocate(request)

        # Emergency dispatch
        dispatch_plan = service.dispatch.dispatch_all(incidents)

        # Shelter assignment
        assignment = service.shelter.assign(26.1, 91.7, persons=400)

        # Multi-objective optimization
        solution = service.optimizer.solve(targets, depots)
    """

    def __init__(
        self,
        risk_engine: RiskEngine | None = None,
        evacuation_engine: EvacuationEngine | None = None,
        resource_engine: ResourceEngine | None = None,
        dispatch_engine: DispatchEngine | None = None,
        shelter_engine: ShelterEngine | None = None,
        optimization_engine: OptimizationEngine | None = None,
    ):
        self.risk: RiskEngine = risk_engine or RiskEngine()
        self.evacuation: EvacuationEngine = evacuation_engine or EvacuationEngine()
        self.resources: ResourceEngine = resource_engine or ResourceEngine()
        self.dispatch: DispatchEngine = dispatch_engine or DispatchEngine()
        self.shelter: ShelterEngine = shelter_engine or ShelterEngine()
        self.optimizer: OptimizationEngine = optimization_engine or OptimizationEngine()

    def health(self) -> dict:
        """Return a simple liveness summary for all engines."""
        return {
            "service": "decision_engine",
            "status": "ok",
            "engines": [
                "risk_engine",
                "evacuation_engine",
                "resource_engine",
                "dispatch_engine",
                "shelter_engine",
                "optimization_engine",
            ],
        }


__all__ = [
    # Facade
    "DecisionService",
    # Risk
    "RiskEngine",
    "RiskLevel",
    "HazardType",
    "HazardInput",
    "RiskAssessment",
    "MultiHazardRiskSummary",
    # Evacuation
    "EvacuationEngine",
    "EvacuationZone",
    "EvacuationRoute",
    "EvacuationPlan",
    "ZoneEvacuationPlan",
    "EvacuationStatus",
    "TransportMode",
    # Resources
    "ResourceEngine",
    "ResourceItem",
    "ResourceRequest",
    "ResourceCategory",
    "ResourceStatus",
    "AllocationDecision",
    "InventorySnapshot",
    # Dispatch
    "DispatchEngine",
    "ResponseUnit",
    "IncidentReport",
    "IncidentSeverity",
    "UnitType",
    "UnitAvailabilityStatus",
    "DispatchOrder",
    "DispatchPlan",
    # Shelter
    "ShelterEngine",
    "Shelter",
    "ShelterType",
    "ShelterStatus",
    "ShelterAssignment",
    "ShelterSystemStatus",
    # Optimization
    "OptimizationEngine",
    "OptimizationObjective",
    "AllocationTarget",
    "ResourceDepot",
    "AllocationResult",
    "OptimizationSolution",
]
