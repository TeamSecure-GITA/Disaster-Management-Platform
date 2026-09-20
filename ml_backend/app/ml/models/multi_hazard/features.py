"""
Feature engineering for multi-hazard risk assessment.

The schema supports:
- Individual hazard model outputs
- Hazard observations
- Population exposure
- Infrastructure exposure
- Vulnerability
- Environmental context

Values must come from actual upstream systems/models.
This module does not fabricate missing hazard scores.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional, Sequence


MULTI_HAZARD_FEATURE_NAMES: tuple[str, ...] = (
    "landslide_risk",
    "flood_risk",
    "cyclone_risk",
    "earthquake_risk",
    "wildfire_risk",
    "rainfall_hazard",
    "river_level_hazard",
    "soil_saturation",
    "seismic_activity",
    "wind_hazard",
    "temperature_hazard",
    "drought_hazard",
    "population_exposure",
    "infrastructure_exposure",
    "critical_infrastructure_exposure",
    "vulnerability_index",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "landslide_risk": (
        "landslide_score",
        "landslide_probability",
        "landslide_hazard",
    ),
    "flood_risk": (
        "flood_score",
        "flood_probability",
        "flood_hazard",
    ),
    "cyclone_risk": (
        "cyclone_score",
        "cyclone_probability",
        "cyclone_hazard",
    ),
    "earthquake_risk": (
        "earthquake_score",
        "earthquake_probability",
        "seismic_risk",
    ),
    "wildfire_risk": (
        "wildfire_score",
        "wildfire_probability",
        "fire_risk",
    ),
    "rainfall_hazard": (
        "rainfall_risk",
        "rainfall_score",
    ),
    "river_level_hazard": (
        "river_risk",
        "river_level_risk",
        "river_hazard",
    ),
    "soil_saturation": (
        "soil_moisture",
        "soil_saturation_index",
    ),
    "seismic_activity": (
        "seismic_activity_index",
        "seismic_signal",
    ),
    "wind_hazard": (
        "wind_risk",
        "wind_score",
    ),
    "temperature_hazard": (
        "temperature_risk",
        "temperature_score",
    ),
    "drought_hazard": (
        "drought_risk",
        "drought_score",
    ),
    "population_exposure": (
        "population_risk",
        "population_density",
        "exposed_population",
    ),
    "infrastructure_exposure": (
        "infrastructure_risk",
        "infrastructure_density",
    ),
    "critical_infrastructure_exposure": (
        "critical_infrastructure_risk",
        "critical_assets_exposure",
    ),
    "vulnerability_index": (
        "vulnerability",
        "community_vulnerability",
    ),
}


@dataclass
class MultiHazardFeatureSet:
    """Validated multi-hazard feature set."""

    values: dict[str, float]

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    feature_names: tuple[str, ...] = (
        MULTI_HAZARD_FEATURE_NAMES
    )

    @property
    def vector(self) -> list[float]:
        """Return features in deterministic order."""

        return [
            self.values[name]
            for name in self.feature_names
        ]


class MultiHazardFeatureEngineer:
    """Validate and normalize multi-hazard features."""

    def __init__(
        self,
        feature_names: Sequence[str] = (
            MULTI_HAZARD_FEATURE_NAMES
        ),
        allow_imputation: bool = False,
        imputation_values: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.feature_names = tuple(feature_names)
        self.allow_imputation = allow_imputation
        self.imputation_values = dict(
            imputation_values or {}
        )

    @staticmethod
    def _to_float(value: Any) -> float:
        if isinstance(value, bool):
            raise ValueError(
                "Boolean values are not valid numeric features."
            )

        number = float(value)

        if not math.isfinite(number):
            raise ValueError(
                "Feature must be finite."
            )

        return number

    @staticmethod
    def _lookup(
        data: Mapping[str, Any],
        feature: str,
    ) -> Any:
        if feature in data:
            return data[feature]

        for alias in FEATURE_ALIASES.get(
            feature,
            (),
        ):
            if alias in data:
                return data[alias]

        return None

    def transform(
        self,
        data: Mapping[str, Any],
    ) -> MultiHazardFeatureSet:
        """Validate supplied multi-hazard observations."""

        values: dict[str, float] = {}
        missing: list[str] = []
        warnings: list[str] = []

        for feature in self.feature_names:
            raw_value = self._lookup(
                data,
                feature,
            )

            if raw_value is None:
                if (
                    self.allow_imputation
                    and feature in self.imputation_values
                ):
                    values[feature] = self._to_float(
                        self.imputation_values[
                            feature
                        ]
                    )

                    warnings.append(
                        f"{feature} was explicitly imputed."
                    )
                else:
                    missing.append(feature)

                continue

            try:
                values[feature] = self._to_float(
                    raw_value
                )
            except (
                TypeError,
                ValueError,
            ) as exc:
                raise ValueError(
                    f"Invalid multi-hazard feature "
                    f"'{feature}': {exc}"
                ) from exc

        # Most risk/index features are expected to be
        # normalized between 0 and 1.
        normalized_features = {
            "landslide_risk",
            "flood_risk",
            "cyclone_risk",
            "earthquake_risk",
            "wildfire_risk",
            "rainfall_hazard",
            "river_level_hazard",
            "soil_saturation",
            "seismic_activity",
            "wind_hazard",
            "temperature_hazard",
            "drought_hazard",
            "population_exposure",
            "infrastructure_exposure",
            "critical_infrastructure_exposure",
            "vulnerability_index",
        }

        for feature in normalized_features:
            if feature not in values:
                continue

            value = values[feature]

            if value < 0.0 or value > 1.0:
                warnings.append(
                    f"{feature}={value} is outside "
                    "the expected normalized range [0, 1]."
                )

        if missing:
            warnings.append(
                "Some hazard/context features are missing."
            )

        return MultiHazardFeatureSet(
            values=values,
            missing_features=missing,
            warnings=warnings,
            feature_names=self.feature_names,
        )