"""
Feature engineering for disaster damage assessment.

Features may originate from:
- Satellite imagery
- Drone imagery
- Geotagged photographs
- Computer-vision models
- GIS layers
- Structural sensors

This module validates structured features; it does not perform image
recognition itself.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional, Sequence


DAMAGE_FEATURE_NAMES: tuple[str, ...] = (
    "structural_change_score",
    "building_damage_score",
    "road_damage_score",
    "bridge_damage_score",
    "vegetation_loss_score",
    "debris_score",
    "flood_extent_score",
    "burn_extent_score",
    "landslide_extent_score",
    "crack_density",
    "roof_damage_score",
    "wall_damage_score",
    "building_count",
    "affected_building_ratio",
    "affected_road_ratio",
    "affected_area_ratio",
    "image_quality_score",
    "cloud_cover_ratio",
    "geolocation_accuracy_m",
    "before_after_similarity",
    "change_detection_confidence",
)


FEATURE_ALIASES: dict[
    str,
    tuple[str, ...],
] = {
    "structural_change_score": (
        "structural_change",
        "structure_change",
        "building_change_score",
    ),
    "building_damage_score": (
        "building_damage",
        "building_damage_probability",
    ),
    "road_damage_score": (
        "road_damage",
        "road_damage_probability",
    ),
    "bridge_damage_score": (
        "bridge_damage",
        "bridge_damage_probability",
    ),
    "vegetation_loss_score": (
        "vegetation_loss",
        "vegetation_change",
    ),
    "debris_score": (
        "debris",
        "debris_probability",
    ),
    "flood_extent_score": (
        "flood_extent",
        "flooded_area_score",
    ),
    "burn_extent_score": (
        "burn_extent",
        "burned_area_score",
    ),
    "landslide_extent_score": (
        "landslide_extent",
        "landslide_area_score",
    ),
    "crack_density": (
        "crack_count",
        "cracks_per_area",
    ),
    "roof_damage_score": (
        "roof_damage",
        "roof_damage_probability",
    ),
    "wall_damage_score": (
        "wall_damage",
        "wall_damage_probability",
    ),
    "building_count": (
        "buildings",
        "detected_buildings",
    ),
    "affected_building_ratio": (
        "damaged_building_ratio",
        "building_impact_ratio",
    ),
    "affected_road_ratio": (
        "damaged_road_ratio",
        "road_impact_ratio",
    ),
    "affected_area_ratio": (
        "damage_area_ratio",
        "affected_land_ratio",
    ),
    "image_quality_score": (
        "image_quality",
        "quality_score",
    ),
    "cloud_cover_ratio": (
        "cloud_cover",
        "cloud_percentage",
    ),
    "geolocation_accuracy_m": (
        "location_accuracy_m",
        "geolocation_error_m",
    ),
    "before_after_similarity": (
        "image_similarity",
        "before_after_match",
    ),
    "change_detection_confidence": (
        "change_confidence",
        "change_detection_score",
    ),
}


@dataclass
class DamageFeatureSet:
    """Validated damage-assessment features."""

    values: dict[str, float]

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    feature_names: tuple[str, ...] = (
        DAMAGE_FEATURE_NAMES
    )

    @property
    def vector(self) -> list[float]:
        return [
            self.values[name]
            for name in self.feature_names
        ]


class DamageFeatureEngineer:
    """Validate structured damage-detection features."""

    def __init__(
        self,
        feature_names: Sequence[str] = (
            DAMAGE_FEATURE_NAMES
        ),
        allow_imputation: bool = False,
        imputation_values: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.feature_names = tuple(
            feature_names
        )

        self.allow_imputation = (
            allow_imputation
        )

        self.imputation_values = dict(
            imputation_values or {}
        )

    @staticmethod
    def _to_float(
        value: Any,
    ) -> float:
        if isinstance(value, bool):
            raise ValueError(
                "Boolean values are not valid numeric features."
            )

        number = float(value)

        if not math.isfinite(number):
            raise ValueError(
                "Feature value must be finite."
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
    ) -> DamageFeatureSet:
        """Validate damage-assessment features."""

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
                    and feature
                    in self.imputation_values
                ):
                    values[feature] = (
                        self._to_float(
                            self.imputation_values[
                                feature
                            ]
                        )
                    )

                    warnings.append(
                        f"{feature} was explicitly imputed."
                    )
                else:
                    missing.append(
                        feature
                    )

                continue

            try:
                values[feature] = (
                    self._to_float(
                        raw_value
                    )
                )
            except (
                TypeError,
                ValueError,
            ) as exc:
                raise ValueError(
                    f"Invalid damage feature "
                    f"'{feature}': {exc}"
                ) from exc

        normalized_features = {
            "structural_change_score",
            "building_damage_score",
            "road_damage_score",
            "bridge_damage_score",
            "vegetation_loss_score",
            "debris_score",
            "flood_extent_score",
            "burn_extent_score",
            "landslide_extent_score",
            "affected_building_ratio",
            "affected_road_ratio",
            "affected_area_ratio",
            "image_quality_score",
            "cloud_cover_ratio",
            "before_after_similarity",
            "change_detection_confidence",
        }

        for feature in normalized_features:
            self._range_warning(
                values,
                feature,
                0.0,
                1.0,
                warnings,
            )

        self._range_warning(
            values,
            "geolocation_accuracy_m",
            0.0,
            None,
            warnings,
        )

        self._range_warning(
            values,
            "building_count",
            0.0,
            None,
            warnings,
        )

        self._range_warning(
            values,
            "crack_density",
            0.0,
            None,
            warnings,
        )

        if (
            "image_quality_score" in values
            and values[
                "image_quality_score"
            ] < 0.5
        ):
            warnings.append(
                "Low image quality may reduce assessment reliability."
            )

        if (
            "cloud_cover_ratio" in values
            and values[
                "cloud_cover_ratio"
            ] > 0.5
        ):
            warnings.append(
                "High cloud cover may reduce satellite-image assessment quality."
            )

        if missing:
            warnings.append(
                "Some damage-assessment features are missing."
            )

        return DamageFeatureSet(
            values=values,
            missing_features=missing,
            warnings=warnings,
            feature_names=self.feature_names,
        )

    @staticmethod
    def _range_warning(
        values: Mapping[str, float],
        feature: str,
        minimum: Optional[float],
        maximum: Optional[float],
        warnings: list[str],
    ) -> None:
        if feature not in values:
            return

        value = values[feature]

        if (
            minimum is not None
            and value < minimum
        ):
            warnings.append(
                f"{feature}={value} is below "
                f"expected minimum {minimum}."
            )

        if (
            maximum is not None
            and value > maximum
        ):
            warnings.append(
                f"{feature}={value} is above "
                f"expected maximum {maximum}."
            )