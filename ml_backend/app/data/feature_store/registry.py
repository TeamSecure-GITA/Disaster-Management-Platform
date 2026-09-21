"""
Feature registry.

Maintains a catalogue of all named features across the platform:
their descriptions, data types, expected ranges, and which ML models
consume them. Acts as the single source of truth for feature governance
and impact analysis (e.g. which models break if a feature changes).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set


class FeatureDataType(str, Enum):
    FLOAT = "float"
    INT = "int"
    BOOL = "bool"
    STRING = "string"
    CATEGORICAL = "categorical"
    EMBEDDING = "embedding"


class FeatureStatus(str, Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    EXPERIMENTAL = "experimental"
    DISABLED = "disabled"


@dataclass
class FeatureDefinition:
    """
    Canonical definition of a single engineered feature.

    Registered in the ``FeatureRegistry`` so that all pipeline components
    operate on a shared, versioned feature schema.
    """

    feature_name: str
    feature_group: str           # Logical grouping (e.g. "weather", "sensor_water")
    description: str
    data_type: FeatureDataType
    status: FeatureStatus = FeatureStatus.ACTIVE
    unit: Optional[str] = None
    expected_min: Optional[float] = None
    expected_max: Optional[float] = None
    nullable: bool = False
    tags: List[str] = field(default_factory=list)
    consuming_models: List[str] = field(default_factory=list)   # Model IDs using this feature
    owner: str = "data-engineering"
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: Optional[str] = None
    version: int = 1

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["data_type"] = self.data_type.value
        d["status"] = self.status.value
        return d

    @property
    def full_name(self) -> str:
        return f"{self.feature_group}.{self.feature_name}"


class FeatureRegistry:
    """
    Centralised catalogue of all registered ML features.

    Example::

        registry = FeatureRegistry()
        registry.register(FeatureDefinition(
            feature_name="rainfall_mm_24h",
            feature_group="weather",
            description="Cumulative rainfall in the preceding 24 hours.",
            data_type=FeatureDataType.FLOAT,
            unit="mm",
            expected_min=0.0,
            expected_max=2000.0,
            tags=["weather", "flood", "landslide"],
            consuming_models=["flood_risk_v2", "landslide_risk_v1"],
        ))

        feat = registry.get("weather", "rainfall_mm_24h")
        models = registry.models_consuming("rainfall_mm_24h")
    """

    def __init__(self):
        # (feature_group, feature_name) -> FeatureDefinition
        self._registry: Dict[str, FeatureDefinition] = {}

    # ------------------------------------------------------------------
    # Registration
    # ------------------------------------------------------------------

    def register(
        self,
        feature: FeatureDefinition,
        overwrite: bool = False,
    ) -> None:
        """Register a feature definition. Raises ValueError on duplicate unless overwrite=True."""
        key = self._key(feature.feature_group, feature.feature_name)
        if key in self._registry and not overwrite:
            raise ValueError(
                f"Feature {feature.full_name!r} already registered. "
                "Pass overwrite=True to update."
            )
        self._registry[key] = feature

    def register_batch(
        self,
        features: List[FeatureDefinition],
        overwrite: bool = False,
    ) -> None:
        for f in features:
            self.register(f, overwrite=overwrite)

    # ------------------------------------------------------------------
    # Lookups
    # ------------------------------------------------------------------

    def get(
        self,
        feature_group: str,
        feature_name: str,
    ) -> Optional[FeatureDefinition]:
        return self._registry.get(self._key(feature_group, feature_name))

    def list_group(self, feature_group: str) -> List[FeatureDefinition]:
        return [
            f for f in self._registry.values()
            if f.feature_group == feature_group
        ]

    def list_all(
        self,
        status_filter: Optional[FeatureStatus] = None,
    ) -> List[FeatureDefinition]:
        features = list(self._registry.values())
        if status_filter:
            features = [f for f in features if f.status == status_filter]
        return sorted(features, key=lambda f: f.full_name)

    def search_by_tag(self, tag: str) -> List[FeatureDefinition]:
        return [f for f in self._registry.values() if tag in f.tags]

    def models_consuming(self, feature_name: str) -> Set[str]:
        """Return the set of model IDs that consume a given feature."""
        models: Set[str] = set()
        for f in self._registry.values():
            if f.feature_name == feature_name:
                models.update(f.consuming_models)
        return models

    def impact_analysis(self, feature_name: str) -> Dict[str, Any]:
        """
        Assess impact of changing or removing a feature.
        Returns affected models, groups, and usage count.
        """
        affected_models: Set[str] = self.models_consuming(feature_name)
        occurrences = [
            f for f in self._registry.values()
            if f.feature_name == feature_name
        ]
        return {
            "feature_name": feature_name,
            "total_definitions": len(occurrences),
            "affected_models": sorted(affected_models),
            "feature_groups": [f.feature_group for f in occurrences],
            "status": [f.status.value for f in occurrences],
        }

    # ------------------------------------------------------------------
    # Management
    # ------------------------------------------------------------------

    def deprecate(self, feature_group: str, feature_name: str) -> bool:
        f = self.get(feature_group, feature_name)
        if f:
            f.status = FeatureStatus.DEPRECATED
            f.updated_at = datetime.now(timezone.utc).isoformat()
            return True
        return False

    def groups(self) -> List[str]:
        return sorted({f.feature_group for f in self._registry.values()})

    def total_features(self, include_deprecated: bool = False) -> int:
        if include_deprecated:
            return len(self._registry)
        return sum(
            1 for f in self._registry.values()
            if f.status != FeatureStatus.DEPRECATED
        )

    def to_catalogue_dict(self) -> Dict[str, Any]:
        """Serialise the full registry as a documentation catalogue."""
        return {
            "total_features": self.total_features(include_deprecated=True),
            "groups": self.groups(),
            "features": [f.to_dict() for f in self.list_all()],
        }

    @staticmethod
    def _key(group: str, name: str) -> str:
        return f"{group}.{name}"


# ---------------------------------------------------------------------------
# Built-in feature definitions for the platform
# ---------------------------------------------------------------------------

def build_default_registry() -> FeatureRegistry:
    """
    Instantiate a ``FeatureRegistry`` pre-populated with the platform's
    standard features across all hazard domains.
    """
    registry = FeatureRegistry()

    defs: List[FeatureDefinition] = [
        # Weather features
        FeatureDefinition("temperature_c", "weather", "Air temperature (Celsius)", FeatureDataType.FLOAT, unit="°C", expected_min=-60, expected_max=60, tags=["weather", "heat_wave"]),
        FeatureDefinition("rainfall_mm_1h", "weather", "Rainfall in past 1 hour", FeatureDataType.FLOAT, unit="mm", expected_min=0, expected_max=600, tags=["weather", "flood", "landslide"]),
        FeatureDefinition("rainfall_mm_24h", "weather", "Cumulative 24-hour rainfall", FeatureDataType.FLOAT, unit="mm", expected_min=0, expected_max=2000, tags=["weather", "flood", "landslide"], consuming_models=["flood_risk_v2", "landslide_risk_v1"]),
        FeatureDefinition("wind_speed_ms", "weather", "Wind speed (m/s)", FeatureDataType.FLOAT, unit="m/s", expected_min=0, expected_max=120, tags=["weather", "cyclone"]),
        FeatureDefinition("pressure_hpa", "weather", "Atmospheric pressure", FeatureDataType.FLOAT, unit="hPa", expected_min=850, expected_max=1090, tags=["weather", "cyclone"]),
        FeatureDefinition("humidity_pct", "weather", "Relative humidity (%)", FeatureDataType.FLOAT, unit="%", expected_min=0, expected_max=100, tags=["weather"]),

        # Sensor features
        FeatureDefinition("water_level_m", "sensor", "River/reservoir water level (metres)", FeatureDataType.FLOAT, unit="m", expected_min=-5, expected_max=50, tags=["flood", "sensor"]),
        FeatureDefinition("water_level_z_score", "sensor", "Z-score vs seasonal baseline", FeatureDataType.FLOAT, tags=["flood", "anomaly"]),
        FeatureDefinition("water_level_trend", "sensor", "Rate of change (m/h)", FeatureDataType.FLOAT, unit="m/h", tags=["flood"]),
        FeatureDefinition("soil_moisture_pct", "sensor", "Volumetric soil moisture saturation", FeatureDataType.FLOAT, unit="%", expected_min=0, expected_max=100, tags=["landslide", "sensor"]),
        FeatureDefinition("seismic_magnitude", "sensor", "Local seismic magnitude", FeatureDataType.FLOAT, expected_min=0, expected_max=10, tags=["earthquake", "sensor"]),

        # Geospatial / static features
        FeatureDefinition("slope_deg", "geospatial", "Mean slope of terrain (degrees)", FeatureDataType.FLOAT, unit="°", expected_min=0, expected_max=90, tags=["landslide", "static"]),
        FeatureDefinition("ndvi", "geospatial", "Normalised Difference Vegetation Index", FeatureDataType.FLOAT, expected_min=-1, expected_max=1, tags=["wildfire", "drought"]),
        FeatureDefinition("elevation_m", "geospatial", "Mean elevation ASL", FeatureDataType.FLOAT, unit="m", tags=["flood", "landslide", "static"]),
        FeatureDefinition("distance_to_coast_km", "geospatial", "Shortest distance to coastline", FeatureDataType.FLOAT, unit="km", tags=["cyclone", "tsunami", "static"]),

        # Population features
        FeatureDefinition("population_density", "population", "Population per sq. km", FeatureDataType.FLOAT, expected_min=0, tags=["risk", "response"]),
        FeatureDefinition("elderly_pct", "population", "Proportion aged > 65", FeatureDataType.FLOAT, expected_min=0, expected_max=1, tags=["vulnerability"]),
        FeatureDefinition("disability_pct", "population", "Proportion with mobility disability", FeatureDataType.FLOAT, expected_min=0, expected_max=1, tags=["vulnerability"]),
    ]

    registry.register_batch(defs)
    return registry
