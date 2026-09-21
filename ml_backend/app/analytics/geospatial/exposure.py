"""
Geospatial exposure and infrastructure vulnerability analysis.

Quantifies vulnerable populations, critical infrastructure assets (hospitals, schools,
power stations, bridges), and economic exposure intersecting hazard buffer perimeters.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Sequence

from .hotspots import haversine_distance_km


@dataclass
class InfrastructureAsset:
    """A critical infrastructure asset subject to disaster exposure."""

    id: str
    name: str
    asset_type: str  # hospital, school, power_station, water_treatment, bridge, shelter
    latitude: float
    longitude: float
    replacement_value_usd: float = 0.0
    capacity_or_population: int = 0
    vulnerability_factor: float = 1.0  # 0.0 (impermeable) to 1.0 (completely fragile)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class HazardZoneDefinition:
    """Geographical impact zone or buffer around a hazard epicenter."""

    hazard_id: str
    hazard_type: str
    center_latitude: float
    center_longitude: float
    primary_radius_km: float
    secondary_buffer_km: float = 0.0
    severity: str = "high"


@dataclass
class ExposureAssessment:
    """Evaluated risk exposure report for a hazard zone."""

    hazard_id: str
    hazard_type: str
    total_assets_at_risk: int
    critical_assets_breakdown: Dict[str, int]
    total_people_at_risk: int
    total_economic_exposure_usd: float
    composite_exposure_score: float  # 0.0 to 100.0
    exposed_asset_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hazard_id": self.hazard_id,
            "hazard_type": self.hazard_type,
            "total_assets_at_risk": self.total_assets_at_risk,
            "critical_assets_breakdown": self.critical_assets_breakdown,
            "total_people_at_risk": self.total_people_at_risk,
            "total_economic_exposure_usd": round(self.total_economic_exposure_usd, 2),
            "composite_exposure_score": round(self.composite_exposure_score, 2),
            "exposed_asset_ids": self.exposed_asset_ids,
        }


class GeospatialExposureAnalyzer:
    """
    Computes exposure statistics by evaluating spatial overlap between hazard perimeters
    and infrastructure / population inventories.
    """

    def __init__(self, assets: Optional[Sequence[InfrastructureAsset]] = None):
        self.assets: List[InfrastructureAsset] = list(assets or [])

    def register_assets(self, assets: Sequence[InfrastructureAsset]) -> None:
        self.assets.extend(assets)

    def evaluate_exposure(
        self,
        zone: HazardZoneDefinition,
        population_density_per_sqkm: float = 250.0,
    ) -> ExposureAssessment:
        """
        Evaluate physical, human, and economic exposure within the defined hazard radius.
        """
        total_radius = zone.primary_radius_km + zone.secondary_buffer_km
        impacted_assets: List[InfrastructureAsset] = []
        asset_counts: Dict[str, int] = {}
        economic_exposure = 0.0
        people_at_risk_assets = 0

        for asset in self.assets:
            dist = haversine_distance_km(
                zone.center_latitude,
                zone.center_longitude,
                asset.latitude,
                asset.longitude,
            )

            if dist <= total_radius:
                impacted_assets.append(asset)
                asset_counts[asset.asset_type] = asset_counts.get(asset.asset_type, 0) + 1

                # Distance attenuation weight: closer to center = higher impact
                attenuation = max(0.2, 1.0 - (dist / total_radius))
                weighted_loss = asset.replacement_value_usd * asset.vulnerability_factor * attenuation
                economic_exposure += weighted_loss
                people_at_risk_assets += asset.capacity_or_population

        # Geographical population estimation based on area
        impact_area_sqkm = math.pi * (total_radius ** 2)
        ambient_population_at_risk = int(impact_area_sqkm * population_density_per_sqkm)
        total_people = max(people_at_risk_assets, ambient_population_at_risk)

        # Composite score normalized from 0 to 100
        # Components: people (log-scale), economic exposure (log-scale), critical asset count
        critical_count = sum(
            count for atype, count in asset_counts.items()
            if atype in ("hospital", "power_station", "water_treatment", "shelter")
        )

        people_subscore = min(40.0, math.log10(max(total_people, 1)) * 8.0)
        econ_subscore = min(35.0, math.log10(max(economic_exposure, 1.0)) * 4.0)
        infra_subscore = min(25.0, critical_count * 5.0)
        composite_score = min(100.0, people_subscore + econ_subscore + infra_subscore)

        return ExposureAssessment(
            hazard_id=zone.hazard_id,
            hazard_type=zone.hazard_type,
            total_assets_at_risk=len(impacted_assets),
            critical_assets_breakdown=asset_counts,
            total_people_at_risk=total_people,
            total_economic_exposure_usd=economic_exposure,
            composite_exposure_score=composite_score,
            exposed_asset_ids=[a.id for a in impacted_assets],
        )
