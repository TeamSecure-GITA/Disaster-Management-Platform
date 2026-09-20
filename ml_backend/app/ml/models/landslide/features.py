"""
Landslide feature schema and deterministic feature engineering.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Mapping, Optional


LANDSLIDE_FEATURE_NAMES: tuple[str, ...] = (
    "rainfall_1h_mm",
    "rainfall_6h_mm",
    "rainfall_24h_mm",
    "rainfall_7d_mm",
    "rainfall_intensity_mm_h",
    "rainfall_24h_7d_ratio",
    "slope_angle_deg",
    "elevation_m",
    "soil_moisture_pct",
    "pore_water_pressure_kpa",
    "ndvi",
    "distance_to_road_m",
    "distance_to_drainage_m",
    "distance_to_fault_m",
    "temperature_c",
    "vegetation_loss_pct",
    "crack_density",
    "ground_displacement_mm",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "rainfall_1h_mm": (
        "rainfall_1h",
        "rain_1h",
        "rainfall_hourly",
    ),
    "rainfall_6h_mm": (
        "rainfall_6h",
        "rain_6h",
    ),
    "rainfall_24h_mm": (
        "rainfall_24h",
        "rain_24h",
        "daily_rainfall",
    ),
    "rainfall_7d_mm": (
        "rainfall_7d",
        "rain_7d",
        "weekly_rainfall",
    ),
    "slope_angle_deg": (
        "slope",
        "slope_angle",
        "slope_degrees",
    ),
    "elevation_m": (
        "elevation",
        "elevation_meters",
    ),
    "soil_moisture_pct": (
        "soil_moisture",
        "soil_moisture_percent",
    ),
    "pore_water_pressure_kpa": (
        "pore_pressure",
        "pore_water_pressure",
    ),
    "ndvi": (
        "vegetation_index",
    ),
    "distance_to_road_m": (
        "road_distance",
        "distance_road",
    ),
    "distance_to_drainage_m": (
        "drainage_distance",
        "distance_drainage",
    ),
    "distance_to_fault_m": (
        "fault_distance",
        "distance_fault",
    ),
    "temperature_c": (
        "temperature",
        "temp_c",
    ),
    "vegetation_loss_pct": (
        "vegetation_loss",
        "vegetation_change_pct",
    ),
    "crack_density": (
        "crack_index",
        "surface_crack_density",
    ),
    "ground_displacement_mm": (
        "displacement",
        "ground_displacement",
    ),
}


@dataclass
class LandslideFeatureSet:
    """Validated landslide input features."""

    rainfall_1h_mm: Optional[float] = None
    rainfall_6h_mm: Optional[float] = None
    rainfall_24h_mm: Optional[float] = None
    rainfall_7d_mm: Optional[float] = None

    rainfall_intensity_mm_h: Optional[float] = None
    rainfall_24h_7d_ratio: Optional[float] = None

    slope_angle_deg: Optional[float] = None
    elevation_m: Optional[float] = None
    soil_moisture_pct: Optional[float] = None
    pore_water_pressure_kpa: Optional[float] = None
    ndvi: Optional[float] = None

    distance_to_road_m: Optional[float] = None
    distance_to_drainage_m: Optional[float] = None
    distance_to_fault_m: Optional[float] = None

    temperature_c: Optional[float] = None
    vegetation_loss_pct: Optional[float] = None
    crack_density: Optional[float] = None
    ground_displacement_mm: Optional[float] = None

    missing_features: list[str] = field(default_factory=list)
    imputed_features: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(
        self,
        include_metadata: bool = False,
    ) -> dict[str, Any]:
        """Return features as a dictionary."""

        data = {
            name: getattr(self, name)
            for name in LANDSLIDE_FEATURE_NAMES
        }

        if include_metadata:
            data.update(
                {
                    "missing_features": list(self.missing_features),
                    "imputed_features": list(self.imputed_features),
                    "warnings": list(self.warnings),
                }
            )

        return data

    def vector(
        self,
        feature_names: tuple[str, ...] = LANDSLIDE_FEATURE_NAMES,
    ) -> list[float]:
        """Return an ordered numeric feature vector."""

        values: list[float] = []

        for name in feature_names:
            value = getattr(self, name, None)

            if value is None:
                raise ValueError(
                    f"Feature '{name}' is missing and cannot be vectorized."
                )

            values.append(float(value))

        return values


class LandslideFeatureEngineer:
    """
    Converts raw sensor/geospatial/environmental input into a deterministic
    landslide feature vector.

    Missing values are never silently presented as observations. If an
    explicit imputation policy is enabled, imputed fields are recorded.
    """

    def __init__(
        self,
        *,
        allow_imputation: bool = False,
        imputation_values: Optional[Mapping[str, float]] = None,
    ) -> None:
        self.allow_imputation = allow_imputation
        self.imputation_values = dict(imputation_values or {})

    @staticmethod
    def _normalise_key(key: str) -> str:
        return (
            str(key)
            .strip()
            .lower()
            .replace("-", "_")
            .replace(" ", "_")
        )

    @staticmethod
    def _to_float(
        value: Any,
        field_name: str,
    ) -> Optional[float]:
        if value is None or value == "":
            return None

        try:
            number = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Feature '{field_name}' must be numeric."
            ) from exc

        if not math.isfinite(number):
            raise ValueError(
                f"Feature '{field_name}' must be finite."
            )

        return number

    def _resolve_input(
        self,
        raw: Mapping[str, Any],
    ) -> dict[str, Any]:
        normalised = {
            self._normalise_key(key): value
            for key, value in raw.items()
        }

        resolved: dict[str, Any] = {}

        for feature in LANDSLIDE_FEATURE_NAMES:
            if feature in normalised:
                resolved[feature] = normalised[feature]
                continue

            for alias in FEATURE_ALIASES.get(feature, ()):
                alias_key = self._normalise_key(alias)

                if alias_key in normalised:
                    resolved[feature] = normalised[alias_key]
                    break

        return resolved

    def _derive(
        self,
        values: dict[str, Optional[float]],
    ) -> None:
        rain_1h = values.get("rainfall_1h_mm")
        rain_24h = values.get("rainfall_24h_mm")
        rain_7d = values.get("rainfall_7d_mm")

        if values.get("rainfall_intensity_mm_h") is None:
            if rain_1h is not None:
                values["rainfall_intensity_mm_h"] = rain_1h

        if values.get("rainfall_24h_7d_ratio") is None:
            if rain_24h is not None and rain_7d is not None:
                if rain_7d > 0:
                    values["rainfall_24h_7d_ratio"] = (
                        rain_24h / rain_7d
                    )

    def validate(
        self,
        feature_set: LandslideFeatureSet,
    ) -> list[str]:
        """Validate physically meaningful ranges."""

        errors: list[str] = []

        def check_range(
            name: str,
            minimum: float | None = None,
            maximum: float | None = None,
        ) -> None:
            value = getattr(feature_set, name)

            if value is None:
                return

            if minimum is not None and value < minimum:
                errors.append(
                    f"{name} must be >= {minimum}, got {value}."
                )

            if maximum is not None and value > maximum:
                errors.append(
                    f"{name} must be <= {maximum}, got {value}."
                )

        for rainfall_field in (
            "rainfall_1h_mm",
            "rainfall_6h_mm",
            "rainfall_24h_mm",
            "rainfall_7d_mm",
        ):
            check_range(rainfall_field, 0.0)

        check_range("slope_angle_deg", 0.0, 90.0)
        check_range("soil_moisture_pct", 0.0, 100.0)
        check_range("ndvi", -1.0, 1.0)
        check_range("vegetation_loss_pct", 0.0, 100.0)
        check_range("distance_to_road_m", 0.0)
        check_range("distance_to_drainage_m", 0.0)
        check_range("distance_to_fault_m", 0.0)

        return errors

    def transform(
        self,
        raw: Mapping[str, Any],
    ) -> LandslideFeatureSet:
        """Transform raw input into validated features."""

        if not isinstance(raw, Mapping):
            raise TypeError("Landslide features must be a mapping.")

        resolved = self._resolve_input(raw)

        values: dict[str, Optional[float]] = {}

        for feature in LANDSLIDE_FEATURE_NAMES:
            values[feature] = self._to_float(
                resolved.get(feature),
                feature,
            )

        self._derive(values)

        missing = [
            name
            for name in LANDSLIDE_FEATURE_NAMES
            if values.get(name) is None
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
                    "Some features were explicitly imputed; "
                    "interpret the model output accordingly."
                )

        feature_set = LandslideFeatureSet(
            **values,
            missing_features=missing,
            imputed_features=imputed,
            warnings=warnings,
        )

        validation_errors = self.validate(feature_set)

        if validation_errors:
            raise ValueError(
                "Invalid landslide features: "
                + "; ".join(validation_errors)
            )

        return feature_set

    def health(self) -> dict[str, Any]:
        return {
            "component": "landslide_feature_engineer",
            "status": "healthy",
            "feature_count": len(LANDSLIDE_FEATURE_NAMES),
            "imputation_enabled": self.allow_imputation,
        }