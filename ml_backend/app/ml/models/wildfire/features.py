"""
Feature schema and engineering for wildfire risk estimation.

Features combine:
- Weather
- Fuel/vegetation
- Drought
- Terrain
- Human exposure
- Historical fire activity
- Lightning
- Satellite/thermal observations

Missing values are never silently fabricated. Explicit imputation can be
enabled by the caller when a trained model expects it.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional, Sequence


WILDFIRE_FEATURE_NAMES: tuple[str, ...] = (
    "temperature_c",
    "relative_humidity_pct",
    "wind_speed_mps",
    "wind_gust_mps",
    "precipitation_24h_mm",
    "precipitation_7d_mm",
    "fuel_moisture_pct",
    "ndvi",
    "vegetation_dryness_index",
    "drought_index",
    "slope_deg",
    "aspect_deg",
    "elevation_m",
    "fuel_load_index",
    "land_cover_code",
    "distance_to_road_km",
    "distance_to_settlement_km",
    "historical_fire_density",
    "lightning_density",
    "hotspot_count",
    "thermal_anomaly_score",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "temperature_c": (
        "temperature",
        "temp",
        "temperature_celsius",
        "air_temperature",
    ),
    "relative_humidity_pct": (
        "relative_humidity",
        "humidity",
        "rh",
        "humidity_pct",
    ),
    "wind_speed_mps": (
        "wind_speed",
        "wind_speed_ms",
        "windspeed",
    ),
    "wind_gust_mps": (
        "wind_gust",
        "gust_speed",
        "wind_gust_ms",
    ),
    "precipitation_24h_mm": (
        "rainfall_24h",
        "rain_24h",
        "precipitation_24h",
    ),
    "precipitation_7d_mm": (
        "rainfall_7d",
        "rain_7d",
        "precipitation_7d",
    ),
    "fuel_moisture_pct": (
        "fuel_moisture",
        "fuel_moisture_percent",
        "vegetation_moisture",
    ),
    "ndvi": (
        "vegetation_index",
        "normalized_difference_vegetation_index",
    ),
    "vegetation_dryness_index": (
        "dryness_index",
        "vegetation_dryness",
        "dryness",
    ),
    "drought_index": (
        "drought",
        "drought_severity",
        "drought_score",
    ),
    "slope_deg": (
        "slope",
        "slope_degrees",
    ),
    "aspect_deg": (
        "aspect",
        "aspect_degrees",
    ),
    "elevation_m": (
        "elevation",
        "altitude",
        "elevation_meters",
    ),
    "fuel_load_index": (
        "fuel_load",
        "fuel_index",
        "biomass_index",
    ),
    "land_cover_code": (
        "land_cover",
        "landcover",
        "land_cover_type",
    ),
    "distance_to_road_km": (
        "road_distance_km",
        "distance_road_km",
    ),
    "distance_to_settlement_km": (
        "settlement_distance_km",
        "distance_settlement_km",
    ),
    "historical_fire_density": (
        "fire_history_density",
        "historical_fires",
        "fire_density",
    ),
    "lightning_density": (
        "lightning_rate",
        "lightning_count",
        "lightning_activity",
    ),
    "hotspot_count": (
        "fire_hotspots",
        "thermal_hotspots",
        "hotspots",
    ),
    "thermal_anomaly_score": (
        "thermal_anomaly",
        "thermal_signal",
        "surface_temperature_anomaly",
    ),
}


@dataclass
class WildfireFeatureSet:
    """Validated wildfire feature vector."""

    values: dict[str, float]

    missing_features: list[str] = field(default_factory=list)
    imputed_features: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    feature_names: tuple[str, ...] = WILDFIRE_FEATURE_NAMES

    @property
    def vector(self) -> list[float]:
        """Return values in deterministic model order."""

        return [self.values[name] for name in self.feature_names]


class WildfireFeatureEngineer:
    """
    Converts raw dictionaries into the canonical wildfire feature schema.
    """

    def __init__(
        self,
        feature_names: Sequence[str] = WILDFIRE_FEATURE_NAMES,
        allow_imputation: bool = False,
        imputation_values: Optional[Mapping[str, float]] = None,
    ) -> None:
        self.feature_names = tuple(feature_names)
        self.allow_imputation = allow_imputation
        self.imputation_values = dict(imputation_values or {})

    @staticmethod
    def _to_float(value: Any) -> float:
        """Convert a supplied value to a finite float."""

        if isinstance(value, bool):
            raise ValueError("Boolean values are not valid numeric features.")

        number = float(value)

        if not math.isfinite(number):
            raise ValueError("Feature value must be finite.")

        return number

    @staticmethod
    def _lookup(
        data: Mapping[str, Any],
        feature: str,
    ) -> Any:
        """Look up canonical name and known aliases."""

        if feature in data:
            return data[feature]

        for alias in FEATURE_ALIASES.get(feature, ()):
            if alias in data:
                return data[alias]

        return None

    def transform(
        self,
        data: Mapping[str, Any],
    ) -> WildfireFeatureSet:
        """Validate and transform raw wildfire observations."""

        values: dict[str, float] = {}
        missing: list[str] = []
        imputed: list[str] = []
        warnings: list[str] = []

        for feature in self.feature_names:
            raw_value = self._lookup(data, feature)

            if raw_value is None:
                if (
                    self.allow_imputation
                    and feature in self.imputation_values
                ):
                    values[feature] = self._to_float(
                        self.imputation_values[feature]
                    )
                    imputed.append(feature)
                else:
                    missing.append(feature)

                continue

            try:
                values[feature] = self._to_float(raw_value)
            except (TypeError, ValueError) as exc:
                raise ValueError(
                    f"Invalid wildfire feature '{feature}': {exc}"
                ) from exc

        # Basic domain validation.
        self._validate_range(
            values,
            "relative_humidity_pct",
            0.0,
            100.0,
            warnings,
        )

        self._validate_range(
            values,
            "fuel_moisture_pct",
            0.0,
            100.0,
            warnings,
        )

        self._validate_range(
            values,
            "ndvi",
            -1.0,
            1.0,
            warnings,
        )

        self._validate_range(
            values,
            "slope_deg",
            0.0,
            90.0,
            warnings,
        )

        self._validate_range(
            values,
            "aspect_deg",
            0.0,
            360.0,
            warnings,
        )

        self._validate_range(
            values,
            "distance_to_road_km",
            0.0,
            None,
            warnings,
        )

        self._validate_range(
            values,
            "distance_to_settlement_km",
            0.0,
            None,
            warnings,
        )

        # These are observations/features, not automatically generated truth.
        if "hotspot_count" in values:
            warnings.append(
                "hotspot_count is treated as an observed/input indicator."
            )

        if "thermal_anomaly_score" in values:
            warnings.append(
                "thermal_anomaly_score is treated as an observed/input indicator."
            )

        if imputed:
            warnings.append(
                "Some missing features were explicitly imputed."
            )

        return WildfireFeatureSet(
            values=values,
            missing_features=missing,
            imputed_features=imputed,
            warnings=warnings,
            feature_names=self.feature_names,
        )

    @staticmethod
    def _validate_range(
        values: Mapping[str, float],
        feature: str,
        minimum: Optional[float],
        maximum: Optional[float],
        warnings: list[str],
    ) -> None:
        """Add warnings for values outside expected physical ranges."""

        if feature not in values:
            return

        value = values[feature]

        if minimum is not None and value < minimum:
            warnings.append(
                f"{feature}={value} is below expected minimum {minimum}."
            )

        if maximum is not None and value > maximum:
            warnings.append(
                f"{feature}={value} is above expected maximum {maximum}."
            )