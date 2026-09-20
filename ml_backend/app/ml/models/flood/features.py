"""
Flood feature schema and feature engineering.

The feature set combines rainfall, river, terrain, soil and infrastructure
signals commonly useful for flood-risk modelling.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional


FLOOD_FEATURE_NAMES: tuple[str, ...] = (
    "rainfall_1h_mm",
    "rainfall_6h_mm",
    "rainfall_24h_mm",
    "rainfall_72h_mm",
    "rainfall_7d_mm",
    "rainfall_intensity_mm_h",
    "rainfall_24h_72h_ratio",
    "river_level_m",
    "river_level_change_m",
    "river_flow_m3s",
    "river_capacity_m3s",
    "river_capacity_ratio",
    "distance_to_river_m",
    "elevation_m",
    "terrain_slope_deg",
    "soil_moisture_pct",
    "soil_infiltration_mm_h",
    "groundwater_level_m",
    "impervious_surface_pct",
    "drainage_capacity_pct",
    "waterlogging_index",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "rainfall_1h_mm": ("rainfall_1h", "rain_1h"),
    "rainfall_6h_mm": ("rainfall_6h", "rain_6h"),
    "rainfall_24h_mm": ("rainfall_24h", "rain_24h"),
    "rainfall_72h_mm": ("rainfall_72h", "rain_72h"),
    "rainfall_7d_mm": ("rainfall_7d", "rain_7d"),
    "river_level_m": ("river_level", "water_level"),
    "river_level_change_m": (
        "river_level_change",
        "water_level_change",
    ),
    "river_flow_m3s": (
        "river_flow",
        "discharge",
        "river_discharge",
    ),
    "river_capacity_m3s": (
        "river_capacity",
        "channel_capacity",
    ),
    "distance_to_river_m": (
        "river_distance",
        "distance_river",
    ),
    "terrain_slope_deg": (
        "slope",
        "terrain_slope",
    ),
    "soil_moisture_pct": (
        "soil_moisture",
        "soil_moisture_percent",
    ),
    "soil_infiltration_mm_h": (
        "infiltration_rate",
        "soil_infiltration",
    ),
    "groundwater_level_m": (
        "groundwater_level",
        "water_table_depth",
    ),
    "impervious_surface_pct": (
        "imperviousness",
        "impervious_area_pct",
    ),
    "drainage_capacity_pct": (
        "drainage_capacity",
    ),
    "waterlogging_index": (
        "waterlogging",
        "waterlogging_score",
    ),
}


@dataclass
class FloodFeatureSet:
    rainfall_1h_mm: Optional[float] = None
    rainfall_6h_mm: Optional[float] = None
    rainfall_24h_mm: Optional[float] = None
    rainfall_72h_mm: Optional[float] = None
    rainfall_7d_mm: Optional[float] = None

    rainfall_intensity_mm_h: Optional[float] = None
    rainfall_24h_72h_ratio: Optional[float] = None

    river_level_m: Optional[float] = None
    river_level_change_m: Optional[float] = None
    river_flow_m3s: Optional[float] = None
    river_capacity_m3s: Optional[float] = None
    river_capacity_ratio: Optional[float] = None

    distance_to_river_m: Optional[float] = None
    elevation_m: Optional[float] = None
    terrain_slope_deg: Optional[float] = None

    soil_moisture_pct: Optional[float] = None
    soil_infiltration_mm_h: Optional[float] = None
    groundwater_level_m: Optional[float] = None

    impervious_surface_pct: Optional[float] = None
    drainage_capacity_pct: Optional[float] = None
    waterlogging_index: Optional[float] = None

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
            for name in FLOOD_FEATURE_NAMES
        }

    def vector(
        self,
        feature_names: tuple[str, ...] = FLOOD_FEATURE_NAMES,
    ) -> list[float]:
        values = []

        for name in feature_names:
            value = getattr(self, name, None)

            if value is None:
                raise ValueError(
                    f"Feature '{name}' is missing."
                )

            values.append(float(value))

        return values


class FloodFeatureEngineer:
    """Validate, derive and normalize flood model inputs."""

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
            self._normalise_key(k): v
            for k, v in raw.items()
        }

        resolved = {}

        for feature in FLOOD_FEATURE_NAMES:
            if feature in normalized:
                resolved[feature] = normalized[feature]
                continue

            for alias in FEATURE_ALIASES.get(
                feature,
                (),
            ):
                alias = self._normalise_key(alias)

                if alias in normalized:
                    resolved[feature] = normalized[alias]
                    break

        return resolved

    def _derive(
        self,
        values: dict[str, Optional[float]],
    ) -> None:
        rain_1h = values["rainfall_1h_mm"]
        rain_24h = values["rainfall_24h_mm"]
        rain_72h = values["rainfall_72h_mm"]

        if (
            values["rainfall_intensity_mm_h"] is None
            and rain_1h is not None
        ):
            values["rainfall_intensity_mm_h"] = rain_1h

        if (
            values["rainfall_24h_72h_ratio"] is None
            and rain_24h is not None
            and rain_72h is not None
            and rain_72h > 0
        ):
            values["rainfall_24h_72h_ratio"] = (
                rain_24h / rain_72h
            )

        flow = values["river_flow_m3s"]
        capacity = values["river_capacity_m3s"]

        if (
            values["river_capacity_ratio"] is None
            and flow is not None
            and capacity is not None
            and capacity > 0
        ):
            values["river_capacity_ratio"] = (
                flow / capacity
            )

    def validate(
        self,
        feature_set: FloodFeatureSet,
    ) -> list[str]:
        errors: list[str] = []

        def check(
            name: str,
            minimum: float | None = None,
            maximum: float | None = None,
        ) -> None:
            value = getattr(feature_set, name)

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
            "rainfall_1h_mm",
            "rainfall_6h_mm",
            "rainfall_24h_mm",
            "rainfall_72h_mm",
            "rainfall_7d_mm",
            "rainfall_intensity_mm_h",
            "river_level_m",
            "river_flow_m3s",
            "river_capacity_m3s",
            "distance_to_river_m",
            "elevation_m",
            "soil_infiltration_mm_h",
        ):
            check(name, 0.0)

        check("soil_moisture_pct", 0.0, 100.0)
        check("impervious_surface_pct", 0.0, 100.0)
        check("drainage_capacity_pct", 0.0, 100.0)
        check("terrain_slope_deg", 0.0, 90.0)

        return errors

    def transform(
        self,
        raw: Mapping[str, Any],
    ) -> FloodFeatureSet:
        if not isinstance(raw, Mapping):
            raise TypeError(
                "Flood features must be a mapping."
            )

        resolved = self._resolve(raw)

        values = {
            feature: self._to_float(
                resolved.get(feature),
                feature,
            )
            for feature in FLOOD_FEATURE_NAMES
        }

        self._derive(values)

        missing = [
            name
            for name in FLOOD_FEATURE_NAMES
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

        feature_set = FloodFeatureSet(
            **values,
            missing_features=missing,
            imputed_features=imputed,
            warnings=warnings,
        )

        errors = self.validate(feature_set)

        if errors:
            raise ValueError(
                "Invalid flood features: "
                + "; ".join(errors)
            )

        return feature_set

    def health(self) -> dict[str, Any]:
        return {
            "component": "flood_feature_engineer",
            "status": "healthy",
            "feature_count": len(
                FLOOD_FEATURE_NAMES
            ),
            "imputation_enabled": self.allow_imputation,
        }