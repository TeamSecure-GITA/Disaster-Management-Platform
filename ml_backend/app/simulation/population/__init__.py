"""
population sub-package public interface.

Re-exports all types and the engine from the split implementation files::

    from app.simulation.population import (
        PopulationSimEngine,
        PopulationSimConfig,
        ExposureZone,
        VulnerabilityIndex,
    )
"""

from .exposure      import (
    DemographicBreakdown,
    DemographicGroup,
    ExposureLevel,
    ExposureMetrics,
    ExposureZone,
    compute_exposure_metrics,
)
from .model         import PopulationSimConfig, PopulationSimEngine, PopulationSimResult, PopulationTimeStep
from .vulnerability import (
    EconomicVulnerability,
    InstitutionalVulnerability,
    PhysicalVulnerability,
    SocialVulnerability,
    VulnerabilityClass,
    VulnerabilityIndex,
    default_vulnerability,
)

__all__ = [
    # Engine
    "PopulationSimEngine",
    "PopulationSimConfig",
    "PopulationSimResult",
    "PopulationTimeStep",
    # Exposure
    "DemographicGroup",
    "ExposureLevel",
    "DemographicBreakdown",
    "ExposureZone",
    "ExposureMetrics",
    "compute_exposure_metrics",
    # Vulnerability
    "VulnerabilityClass",
    "PhysicalVulnerability",
    "SocialVulnerability",
    "EconomicVulnerability",
    "InstitutionalVulnerability",
    "VulnerabilityIndex",
    "default_vulnerability",
]
