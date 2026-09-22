"""
Population exposure data models.

Defines geographic exposure zones and the metrics used to quantify how
many people, and which demographic groups, are exposed to a hazard.
These types are imported by the population simulation model.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


# ============================================================
# Enumerations
# ============================================================

class DemographicGroup(str, Enum):
    """Population demographic segments relevant for disaster triage."""

    GENERAL        = "general"
    CHILDREN       = "children"        # < 15 years
    ELDERLY        = "elderly"         # ≥ 65 years
    MOBILITY_LIMITED = "mobility_limited"
    MEDICAL        = "medical"         # Chronic illness / hospital patients


class ExposureLevel(str, Enum):
    """Qualitative exposure severity tier."""

    NONE     = "none"
    LOW      = "low"
    MODERATE = "moderate"
    HIGH     = "high"
    EXTREME  = "extreme"


# ============================================================
# Sub-models
# ============================================================

@dataclass
class DemographicBreakdown:
    """
    Population count per demographic group within an exposure zone.

    Attributes:
        total: Total persons in this zone.
        children: Count aged < 15 years.
        elderly: Count aged ≥ 65 years.
        mobility_limited: Persons requiring assisted movement.
        medical: Persons with chronic conditions or hospital patients.
    """

    total: int
    children: int = 0
    elderly: int = 0
    mobility_limited: int = 0
    medical: int = 0

    @property
    def vulnerable_total(self) -> int:
        """Combined count of all vulnerable sub-groups."""

        return self.children + self.elderly + self.mobility_limited + self.medical

    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            "vulnerable_total": self.vulnerable_total,
        }


@dataclass
class ExposureZone:
    """
    A geographic unit characterising population exposure to a hazard.

    Attributes:
        zone_id: Unique identifier.
        name: Human-readable label.
        latitude: Centroid latitude (WGS-84).
        longitude: Centroid longitude (WGS-84).
        area_sqkm: Geographic area.
        demographics: Population breakdown.
        exposure_level: Qualitative exposure severity.
        hazard_intensity: Normalised hazard intensity at this location (0–1).
        distance_from_epicentre_km: Straight-line distance from hazard origin.
        is_evacuation_required: Whether this zone should be evacuated.
    """

    zone_id: str
    name: str
    latitude: float
    longitude: float
    area_sqkm: float
    demographics: DemographicBreakdown
    exposure_level: ExposureLevel = ExposureLevel.MODERATE
    hazard_intensity: float = 0.5
    distance_from_epicentre_km: float = 0.0
    is_evacuation_required: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "area_sqkm": self.area_sqkm,
            "exposure_level": self.exposure_level.value,
            "hazard_intensity": self.hazard_intensity,
            "distance_from_epicentre_km": (
                self.distance_from_epicentre_km
            ),
            "is_evacuation_required": self.is_evacuation_required,
            "demographics": self.demographics.to_dict(),
        }


# ============================================================
# Derived metrics
# ============================================================

@dataclass
class ExposureMetrics:
    """
    Derived quantitative exposure metrics for a collection of zones.

    Typically produced by the population model after aggregating all
    ExposureZone records.

    Attributes:
        total_exposed: Sum of all persons in exposed zones.
        vulnerable_exposed: Sum of all vulnerable sub-group persons.
        vulnerability_ratio: vulnerable_exposed / total_exposed.
        weighted_intensity: Population-weighted mean hazard intensity.
        zones_requiring_evacuation: Count of zones flagged for evacuation.
        extreme_exposure_zones: Count of ExposureLevel.EXTREME zones.
    """

    total_exposed: int
    vulnerable_exposed: int
    vulnerability_ratio: float
    weighted_intensity: float
    zones_requiring_evacuation: int
    extreme_exposure_zones: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_exposed": self.total_exposed,
            "vulnerable_exposed": self.vulnerable_exposed,
            "vulnerability_ratio": round(self.vulnerability_ratio, 4),
            "weighted_intensity": round(self.weighted_intensity, 4),
            "zones_requiring_evacuation": (
                self.zones_requiring_evacuation
            ),
            "extreme_exposure_zones": self.extreme_exposure_zones,
        }


# ============================================================
# Helper functions
# ============================================================

def compute_exposure_metrics(
    zones: List[ExposureZone],
) -> ExposureMetrics:
    """
    Aggregate ExposureZone records into population-level metrics.

    Args:
        zones: List of exposure zones to aggregate.

    Returns:
        ExposureMetrics with population-weighted statistics.
    """

    if not zones:
        return ExposureMetrics(
            total_exposed=0,
            vulnerable_exposed=0,
            vulnerability_ratio=0.0,
            weighted_intensity=0.0,
            zones_requiring_evacuation=0,
            extreme_exposure_zones=0,
        )

    total = sum(z.demographics.total for z in zones)
    vulnerable = sum(z.demographics.vulnerable_total for z in zones)

    # Population-weighted intensity.
    weighted_int = (
        sum(
            z.demographics.total * z.hazard_intensity
            for z in zones
        )
        / max(total, 1)
    )

    evac_zones = sum(1 for z in zones if z.is_evacuation_required)
    extreme_zones = sum(
        1 for z in zones
        if z.exposure_level == ExposureLevel.EXTREME
    )

    return ExposureMetrics(
        total_exposed=total,
        vulnerable_exposed=vulnerable,
        vulnerability_ratio=vulnerable / max(total, 1),
        weighted_intensity=weighted_int,
        zones_requiring_evacuation=evac_zones,
        extreme_exposure_zones=extreme_zones,
    )


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "DemographicGroup",
    "ExposureLevel",
    "DemographicBreakdown",
    "ExposureZone",
    "ExposureMetrics",
    "compute_exposure_metrics",
]
