"""
Cyclone feature schema and deterministic feature engineering.

The features describe an observed/forecast cyclone environment. They do not
attempt deterministic cyclone-track or landfall prediction.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional


CYCLONE_FEATURE_NAMES: tuple[str, ...] = (
    "wind_speed_kmh",
    "wind_gust_kmh",
    "central_pressure_hpa",
    "pressure_change_hpa",
    "rainfall_1h_mm",
    "rainfall_24h_mm",
    "rainfall_72h_mm",
    "storm_surge_m",
    "wave_height_m",
    "sea_surface_temperature_c",
    "distance_to_coast_km",
    "elevation_m",
    "coastal_exposure_index",
    "population_density_per_km2",
    "critical_infrastructure_density",
    "forecast_track_error_km",
    "wind_radius_km",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "wind_speed_kmh": (
        "wind_speed",
        "max_wind_speed",
        "sustained_wind",
    ),
    "wind_gust_kmh": (
        "wind_gust",
        "gust_speed",
    ),
    "central_pressure_hpa": (
        "central_pressure",
        "pressure_hpa",
    ),
    "pressure_change_hpa": (
        "pressure_change",
        "pressure_delta",
    ),
    "rainfall_1h_mm": (
        "rain_1h",
        "rainfall_1h",
    ),
    "rainfall_24h_mm": (
        "rain_24h",
        "rainfall_24h",
    ),
    "rainfall_72h_mm": (
        "rain_72h",
        "rainfall_72h",
    ),
    "storm_surge_m": (
        "surge",
        "storm_surge",
    ),
    "wave_height_m": (
        "wave_height",
        "significant_wave_height",
    ),
    "sea_surface_temperature_c": (
        "sst",
        "sea_surface_temperature",
    ),
    "distance_to_coast_km": (
        "coast_distance_km",
        "distance_coast",
    ),
    "coastal_exposure_index": (
        "coastal_exposure",
        "exposure_index",
    ),
    "population_density_per_km2": (
        "population_density",
    ),
    "critical_infrastructure_density": (
        "infrastructure_density",
    ),
    "forecast_track_error_km": (
        "track_error",
    ),
    "wind_radius_km": (
        "radius_of_winds",
        "wind_radius",
    ),
}


@dataclass
class CycloneFeatureSet:
    wind_speed_kmh: Optional[float] = None
    wind_gust_kmh: Optional[float] = None
    central_pressure_hpa: Optional[float] = None
    pressure_change_hpa: Optional[float] = None

    rainfall_1h_mm: Optional[float] = None
    rainfall_24h_mm: Optional[float] = None
    rainfall_72h_mm: Optional[float] = None

    storm_surge_m: Optional[float] = None
    wave_height_m: Optional[float] = None
    sea_surface_temperature_c: Optional[float] = None

    distance_to_coast_km: Optional[float] = None
    elevation_m: Optional[float] = None
    coastal_exposure_index: Optional[float] = None

    population_density_per_km2: Optional[float] = None
    critical_infrastructure_density: Optional[float] = None

    forecast_track_error_km: Optional[float] = None
    wind_radius_km: Optional[float] = None

    missing_features: list[str] = field(
        default_factory=list
    )
    imputed_features: list[str] = field(
        default_factory=list
    )
    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            name: getattr(self, name)
            for name in CYCLONE_FEATURE_NAMES
        }

    def vector(
        self,
        feature_names: tuple[str, ...] = CYCLONE_FEATURE_NAMES,
    ) -> list[float]:
        result = []

        for name in feature_names:
            value = getattr(self, name, None)

            if value is None:
                raise ValueError(
                    f"Feature '{name}' is missing."
                )

            result.append(float(value))

        return result


class CycloneFeatureEngineer:
    """Validate and engineer cyclone-risk model inputs."""

    def __init__(
        self,
        *,
        allow_imputation: bool = False,
        imputation_values: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.allow_imputation = allow_imputation
        self.imputation_values = dict(
            imputation_values or {}
        )

    @staticmethod
    def _key(key: str) -> str:
        return (
            str(key)
            .strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

    @staticmethod
    def _float(
        value: Any,
        name: str,
    ) -> Optional[float]:
        if value is None or value == "":
            return None

        try:
            result = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Feature '{name}' must be numeric."
            ) from exc

        if not math.isfinite(result):
            raise ValueError(
                f"Feature '{name}' must be finite."
            )

        return result

    def _resolve(
        self,
        raw: Mapping[str, Any],
    ) -> dict[str, Any]:
        normalized = {
            self._key(k): v
            for k, v in raw.items()
        }

        resolved: dict[str, Any] = {}

        for feature in CYCLONE_FEATURE_NAMES:
            if feature in normalized:
                resolved[feature] = normalized[feature]
                continue

            for alias in FEATURE_ALIASES.get(
                feature,
                (),
            ):
                alias_key = self._key(alias)

                if alias_key in normalized:
                    resolved[feature] = normalized[alias_key]
                    break

        return resolved

    def validate(
        self,
        features: CycloneFeatureSet,
    ) -> list[str]:
        errors: list[str] = []

        def check(
            name: str,
            minimum: float | None = None,
            maximum: float | None = None,
        ) -> None:
            value = getattr(features, name)

            if value is None:
                return

            if minimum is not None and value < minimum:
                errors.append(
                    f"{name} must be >= {minimum}."
                )

            if maximum is not None and value > maximum:
                errors.append(
                    f"{name} must be <= {maximum}."
                )

        for name in (
            "wind_speed_kmh",
            "wind_gust_kmh",
            "rainfall_1h_mm",
            "rainfall_24h_mm",
            "rainfall_72h_mm",
            "storm_surge_m",
            "wave_height_m",
            "distance_to_coast_km",
            "elevation_m",
            "population_density_per_km2",
            "critical_infrastructure_density",
            "forecast_track_error_km",
            "wind_radius_km",
        ):
            check(name, 0.0)

        check(
            "central_pressure_hpa",
            800.0,
            1100.0,
        )

        check(
            "sea_surface_temperature_c",
            -5.0,
            45.0,
        )

        check(
            "coastal_exposure_index",
            0.0,
            1.0,
        )

        return errors

    def transform(
        self,
        raw: Mapping[str, Any],
    ) -> CycloneFeatureSet:
        if not isinstance(raw, Mapping):
            raise TypeError(
                "Cyclone features must be a mapping."
            )

        resolved = self._resolve(raw)

        values = {
            feature: self._float(
                resolved.get(feature),
                feature,
            )
            for feature in CYCLONE_FEATURE_NAMES
        }

        missing = [
            name
            for name in CYCLONE_FEATURE_NAMES
            if values[name] is None
        ]

        imputed: list[str] = []
        warnings: list[str] = []

        if self.allow_imputation:
            for name in list(missing):
                if name in self.imputation_values:
                    values[name] = float(
                        self.imputation_values[name]
                    )
                    imputed.append(name)
                    missing.remove(name)

            if imputed:
                warnings.append(
                    "Explicit feature imputation was used."
                )

        features = CycloneFeatureSet(
            **values,
            missing_features=missing,
            imputed_features=imputed,
            warnings=warnings,
        )

        errors = self.validate(features)

        if errors:
            raise ValueError(
                "Invalid cyclone features: "
                + "; ".join(errors)
            )

        return features

    def health(self) -> dict[str, Any]:
        return {
            "component": "cyclone_feature_engineer",
            "status": "healthy",
            "feature_count": len(
                CYCLONE_FEATURE_NAMES
            ),
            "imputation_enabled": self.allow_imputation,
        }