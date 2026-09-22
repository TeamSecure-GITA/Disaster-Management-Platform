"""
SimulationService — single facade over all simulation sub-modules.

Provides a unified interface for API route handlers so routes never
import from the sub-packages directly.  Follows the same pattern as
the DecisionEngineService in the decision_engine module.

Typical usage from a route handler::

    service = get_simulation_service()

    # Digital twin
    result = service.run_digital_twin_scenario(scenario_input)

    # Evacuation
    result = service.run_evacuation_simulation(evac_config)

    # Multi-hazard cascade
    result = service.run_cascade(cascade_config)

    # Population dynamics
    result = service.run_population_sim(pop_config)

    # What-if analysis
    result = service.analyze_intervention(what_if_scenario)
    comparison = service.compare_interventions(scenario_list)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .digital_twin import (
    BatchScenarioResult,
    DigitalTwinEngine,
    ScenarioInput,
    ScenarioRegistry,
    ScenarioResult,
    ScenarioType,
)
from .evacuation import EvacSimConfig, EvacSimResult, EvacuationSimEngine
from .multi_hazard import CascadeSimConfig, CascadeSimResult, MultiHazardSimEngine
from .population import PopulationSimConfig, PopulationSimEngine, PopulationSimResult
from .what_if import ComparisonResult, WhatIfEngine, WhatIfResult, WhatIfScenario


# ============================================================
# Facade
# ============================================================

class SimulationService:
    """
    Unified simulation service facade.

    Lazily instantiates each engine on first use to minimise startup time.
    All engines share a single ScenarioRegistry for state tracking.

    Args:
        monte_carlo_samples: Passed to DigitalTwinEngine.
        random_seed: Optional seed for reproducible results across all engines.
    """

    def __init__(
        self,
        monte_carlo_samples: int = 200,
        random_seed: Optional[int] = None,
    ):
        self._monte_carlo_samples = monte_carlo_samples
        self._random_seed = random_seed

        # Shared state registry.
        self._registry = ScenarioRegistry(max_records=1000)

        # Engines — created lazily.
        self._digital_twin: Optional[DigitalTwinEngine]     = None
        self._evacuation:   Optional[EvacuationSimEngine]   = None
        self._cascade:      Optional[MultiHazardSimEngine]  = None
        self._population:   Optional[PopulationSimEngine]   = None
        self._what_if:      Optional[WhatIfEngine]          = None

    # --------------------------------------------------------
    # Digital twin
    # --------------------------------------------------------

    @property
    def digital_twin(self) -> DigitalTwinEngine:
        if self._digital_twin is None:
            self._digital_twin = DigitalTwinEngine(
                monte_carlo_samples=self._monte_carlo_samples,
                random_seed=self._random_seed,
                registry=self._registry,
            )
        return self._digital_twin

    def run_digital_twin_scenario(
        self,
        scenario: ScenarioInput,
        scenario_id: Optional[str] = None,
    ) -> ScenarioResult:
        """Execute a single physics-based disaster scenario."""
        return self.digital_twin.run_scenario(scenario, scenario_id)

    def run_batch_scenarios(
        self,
        scenarios: List[ScenarioInput],
        batch_id: Optional[str] = None,
    ) -> BatchScenarioResult:
        """Execute multiple scenarios in sequence."""
        return self.digital_twin.run_batch(scenarios, batch_id)

    # --------------------------------------------------------
    # Evacuation
    # --------------------------------------------------------

    @property
    def evacuation(self) -> EvacuationSimEngine:
        if self._evacuation is None:
            self._evacuation = EvacuationSimEngine()
        return self._evacuation

    def run_evacuation_simulation(
        self,
        config: EvacSimConfig,
        simulation_id: Optional[str] = None,
    ) -> EvacSimResult:
        """Run discrete-event evacuation simulation."""
        return self.evacuation.simulate(config, simulation_id)

    # --------------------------------------------------------
    # Multi-hazard cascade
    # --------------------------------------------------------

    @property
    def cascade(self) -> MultiHazardSimEngine:
        if self._cascade is None:
            self._cascade = MultiHazardSimEngine(
                random_seed=self._random_seed
            )
        return self._cascade

    def run_cascade(
        self,
        config: CascadeSimConfig,
        simulation_id: Optional[str] = None,
    ) -> CascadeSimResult:
        """Run multi-hazard cascade simulation."""
        return self.cascade.simulate_cascade(config, simulation_id)

    # --------------------------------------------------------
    # Population dynamics
    # --------------------------------------------------------

    @property
    def population(self) -> PopulationSimEngine:
        if self._population is None:
            self._population = PopulationSimEngine()
        return self._population

    def run_population_sim(
        self,
        config: PopulationSimConfig,
        simulation_id: Optional[str] = None,
    ) -> PopulationSimResult:
        """Run population dynamics simulation."""
        return self.population.simulate(config, simulation_id)

    def project_displacement(
        self,
        total_population: int,
        hazard_intensity: float,
        days: int = 30,
    ) -> List[Dict[str, Any]]:
        """Lightweight displacement-only projection."""
        return self.population.project_displacement(
            total_population, hazard_intensity, days
        )

    # --------------------------------------------------------
    # What-if analysis
    # --------------------------------------------------------

    @property
    def what_if(self) -> WhatIfEngine:
        if self._what_if is None:
            self._what_if = WhatIfEngine()
        return self._what_if

    def analyze_intervention(
        self,
        scenario: WhatIfScenario,
        analysis_id: Optional[str] = None,
    ) -> WhatIfResult:
        """Analyse a single what-if intervention scenario."""
        return self.what_if.analyze(scenario, analysis_id)

    def compare_interventions(
        self,
        scenarios: List[WhatIfScenario],
        comparison_id: Optional[str] = None,
    ) -> ComparisonResult:
        """Compare multiple intervention scenarios and produce a ranked report."""
        return self.what_if.compare_interventions(scenarios, comparison_id)

    # --------------------------------------------------------
    # Registry
    # --------------------------------------------------------

    def registry_summary(self) -> Dict[str, Any]:
        """Return the scenario registry health summary."""
        return self._registry.summary()

    # --------------------------------------------------------
    # Health
    # --------------------------------------------------------

    def health(self) -> Dict[str, Any]:
        """Return overall simulation service health."""

        return {
            "service": "simulation_service",
            "status": "ok",
            "engines": {
                "digital_twin": (
                    self.digital_twin.health()
                    if self._digital_twin else "not_initialised"
                ),
                "evacuation": (
                    self.evacuation.health()
                    if self._evacuation else "not_initialised"
                ),
                "cascade": (
                    self.cascade.health()
                    if self._cascade else "not_initialised"
                ),
                "population": (
                    self.population.health()
                    if self._population else "not_initialised"
                ),
                "what_if": (
                    self.what_if.health()
                    if self._what_if else "not_initialised"
                ),
            },
            "registry": self._registry.summary(),
        }


# ============================================================
# Dependency-injection helper
# ============================================================

_service_instance: Optional[SimulationService] = None


def get_simulation_service() -> SimulationService:
    """
    Return the process-level SimulationService singleton.

    Call this from FastAPI route dependencies::

        @router.get("/health")
        def health(service: SimulationService = Depends(get_simulation_service)):
            return service.health()
    """

    global _service_instance

    if _service_instance is None:
        _service_instance = SimulationService()

    return _service_instance
