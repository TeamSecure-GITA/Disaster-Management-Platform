"""
Earthquake/seismic feature schema and feature engineering.

These features represent observed seismic signals, event characteristics,
site conditions and historical/geospatial context.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional


EARTHQUAKE_FEATURE_NAMES: tuple[str, ...] = (
    "seismic_amplitude",
    "peak_ground_acceleration_g",
    "peak_ground_velocity_cm_s",
    "dominant_frequency_hz",
    "signal_duration_s",
    "signal_to_noise_ratio",
    "p_wave_energy",
    "s_wave_energy",
    "p_s_energy_ratio",
    "estimated_magnitude",
    "event_depth_km",
    "distance_to_epicenter_km",
    "distance_to_fault_km",
    "site_soil_factor",
    "historical_event_density",
    "aftershock_count",
    "station_count",
    "station_agreement",
)


FEATURE_ALIASES: dict[str, tuple[str, ...]] = {
    "seismic_amplitude": (
        "amplitude",
        "seismic_signal_amplitude",
    ),
    "peak_ground_acceleration_g": (
        "pga",
        "peak_acceleration",
    ),
    "peak_ground_velocity_cm_s": (
        "pgv",
        "peak_velocity",
    ),
    "dominant_frequency_hz": (
        "dominant_frequency",
        "frequency",
    ),
    "signal_duration_s": (
        "duration",
        "signal_duration",
    ),
    "signal_to_noise_ratio": (
        "snr",
        "signal_noise_ratio",
    ),
    "p_wave_energy": (
        "p_energy",
        "pwave_energy",
    ),
    "s_wave_energy": (
        "s_energy",
        "swave_energy",
    ),
    "p_s_energy_ratio": (
        "ps_ratio",
        "p_s_ratio",
    ),
    "estimated_magnitude": (
        "magnitude",
        "estimated_ml",
        "estimated_mw",
    ),
    "event_depth_km": (
        "depth",
        "depth_km",
    ),
    "distance_to_epicenter_km": (
        "epicenter_distance",
        "distance_epicenter",
    ),
    "distance_to_fault_km": (
        "fault_distance",
        "distance_fault",
    ),
    "site_soil_factor": (
        "soil_factor",
        "site_amplification",
    ),
    "historical_event_density": (
        "historical_density",
        "event_density",
    ),
    "aftershock_count": (
        "aftershocks",
    ),
    "station_count": (
        "seismic_station_count",
    ),
    "station_agreement": (
        "station_consensus",
        "sensor_agreement",
    ),
}


@dataclass
class EarthquakeFeatureSet:
    seismic_amplitude: Optional[float] = None
    peak_ground_acceleration_g: Optional[float] = None
    peak_ground_velocity_cm_s: Optional[float] = None
    dominant_frequency_hz: Optional[float] = None
    signal_duration_s: Optional[float] = None
    signal_to_noise_ratio: Optional[float] = None

    p_wave_energy: Optional[float] = None
    s_wave_energy: Optional[float] = None
    p_s_energy_ratio: Optional[float] = None

    estimated_magnitude: Optional[float] = None
    event_depth_km: Optional[float] = None
    distance_to_epicenter_km: Optional[float] = None
    distance_to_fault_km: Optional[float] = None

    site_soil_factor: Optional[float] = None
    historical_event_density: Optional[float] = None
    aftershock_count: Optional[float] = None

    station_count: Optional[float] = None
    station_agreement: Optional[float] = None

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
            for name in EARTHQUAKE_FEATURE_NAMES
        }

    def vector(
        self,
        feature_names: tuple[str, ...] = (
            EARTHQUAKE_FEATURE_NAMES
        ),
    ) -> list[float]:
        result = []

        for name in feature_names:
            value = getattr(
                self,
                name,
                None,
            )

            if value is None:
                raise ValueError(
                    f"Feature '{name}' is missing."
                )

            result.append(float(value))

        return result


class EarthquakeFeatureEngineer:
    """Validate and derive seismic model features."""

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
    def _normalise_key(
        key: str,
    ) -> str:
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
        except (
            TypeError,
            ValueError,
        ) as exc:
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
            self._normalise_key(key): value
            for key, value in raw.items()
        }

        resolved: dict[str, Any] = {}

        for feature in EARTHQUAKE_FEATURE_NAMES:
            if feature in normalized:
                resolved[feature] = normalized[feature]
                continue

            for alias in FEATURE_ALIASES.get(
                feature,
                (),
            ):
                alias_key = self._normalise_key(
                    alias
                )

                if alias_key in normalized:
                    resolved[feature] = (
                        normalized[alias_key]
                    )
                    break

        return resolved

    def _derive(
        self,
        values: dict[str, Optional[float]],
    ) -> None:
        p_energy = values[
            "p_wave_energy"
        ]

        s_energy = values[
            "s_wave_energy"
        ]

        if (
            values["p_s_energy_ratio"] is None
            and p_energy is not None
            and s_energy is not None
            and s_energy > 0
        ):
            values["p_s_energy_ratio"] = (
                p_energy / s_energy
            )

    def validate(
        self,
        features: EarthquakeFeatureSet,
    ) -> list[str]:
        errors: list[str] = []

        def check(
            name: str,
            minimum: float | None = None,
            maximum: float | None = None,
        ) -> None:
            value = getattr(
                features,
                name,
            )

            if value is None:
                return

            if (
                minimum is not None
                and value < minimum
            ):
                errors.append(
                    f"{name} must be >= {minimum}."
                )

            if (
                maximum is not None
                and value > maximum
            ):
                errors.append(
                    f"{name} must be <= {maximum}."
                )

        for name in (
            "seismic_amplitude",
            "peak_ground_acceleration_g",
            "peak_ground_velocity_cm_s",
            "dominant_frequency_hz",
            "signal_duration_s",
            "signal_to_noise_ratio",
            "p_wave_energy",
            "s_wave_energy",
            "event_depth_km",
            "distance_to_epicenter_km",
            "distance_to_fault_km",
            "historical_event_density",
            "aftershock_count",
            "station_count",
        ):
            check(name, 0.0)

        check(
            "estimated_magnitude",
            -2.0,
            10.0,
        )

        check(
            "site_soil_factor",
            0.0,
        )

        check(
            "station_agreement",
            0.0,
            1.0,
        )

        return errors

    def transform(
        self,
        raw: Mapping[str, Any],
    ) -> EarthquakeFeatureSet:
        if not isinstance(raw, Mapping):
            raise TypeError(
                "Earthquake features must be a mapping."
            )

        resolved = self._resolve(raw)

        values = {
            feature: self._to_float(
                resolved.get(feature),
                feature,
            )
            for feature in EARTHQUAKE_FEATURE_NAMES
        }

        self._derive(values)

        missing = [
            name
            for name in EARTHQUAKE_FEATURE_NAMES
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

        features = EarthquakeFeatureSet(
            **values,
            missing_features=missing,
            imputed_features=imputed,
            warnings=warnings,
        )

        errors = self.validate(features)

        if errors:
            raise ValueError(
                "Invalid earthquake features: "
                + "; ".join(errors)
            )

        return features

    def health(self) -> dict[str, Any]:
        return {
            "component": (
                "earthquake_feature_engineer"
            ),
            "status": "healthy",
            "feature_count": len(
                EARTHQUAKE_FEATURE_NAMES
            ),
            "imputation_enabled": (
                self.allow_imputation
            ),
        }