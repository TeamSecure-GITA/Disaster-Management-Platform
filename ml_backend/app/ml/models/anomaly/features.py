"""
Feature engineering for anomaly detection.

Designed for disaster-management telemetry such as:
- Seismic sensors
- Rain gauges
- River gauges
- Weather stations
- Soil sensors
- Slope monitoring
- Structural sensors
- Environmental stations
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional, Sequence


ANOMALY_FEATURE_NAMES: tuple[str, ...] = (
    "sensor_value",
    "value_change",
    "rate_of_change",
    "rolling_mean",
    "rolling_std",
    "z_score",
    "signal_amplitude",
    "signal_frequency",
    "signal_noise_ratio",
    "rainfall_intensity",
    "river_level",
    "soil_moisture",
    "soil_saturation",
    "ground_vibration",
    "ground_acceleration",
    "slope_displacement",
    "temperature",
    "relative_humidity",
    "wind_speed",
    "sensor_battery",
    "sensor_signal_quality",
)


FEATURE_ALIASES: dict[
    str,
    tuple[str, ...],
] = {
    "sensor_value": (
        "value",
        "measurement",
        "reading",
        "sensor_reading",
    ),
    "value_change": (
        "delta",
        "change",
        "measurement_change",
    ),
    "rate_of_change": (
        "roc",
        "change_rate",
        "velocity",
    ),
    "rolling_mean": (
        "moving_average",
        "mean",
        "rolling_avg",
    ),
    "rolling_std": (
        "moving_std",
        "standard_deviation",
        "rolling_standard_deviation",
    ),
    "z_score": (
        "zscore",
        "standardized_value",
    ),
    "signal_amplitude": (
        "amplitude",
        "signal_strength",
    ),
    "signal_frequency": (
        "frequency",
        "dominant_frequency",
    ),
    "signal_noise_ratio": (
        "snr",
        "signal_to_noise_ratio",
    ),
    "rainfall_intensity": (
        "rain_intensity",
        "precipitation_intensity",
    ),
    "river_level": (
        "water_level",
        "river_height",
    ),
    "soil_moisture": (
        "soil_water_content",
        "moisture",
    ),
    "soil_saturation": (
        "saturation",
        "soil_saturation_index",
    ),
    "ground_vibration": (
        "vibration",
        "ground_motion",
    ),
    "ground_acceleration": (
        "pga",
        "acceleration",
    ),
    "slope_displacement": (
        "slope_movement",
        "displacement",
        "ground_displacement",
    ),
    "temperature": (
        "temperature_c",
        "air_temperature",
    ),
    "relative_humidity": (
        "humidity",
        "relative_humidity_pct",
        "rh",
    ),
    "wind_speed": (
        "wind",
        "wind_speed_mps",
    ),
    "sensor_battery": (
        "battery",
        "battery_level",
        "battery_pct",
    ),
    "sensor_signal_quality": (
        "signal_quality",
        "quality",
        "telemetry_quality",
    ),
}


@dataclass
class AnomalyFeatureSet:
    """Validated anomaly feature set."""

    values: dict[str, float]

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    feature_names: tuple[str, ...] = (
        ANOMALY_FEATURE_NAMES
    )

    @property
    def vector(self) -> list[float]:
        """Return deterministic feature vector."""

        return [
            self.values[name]
            for name in self.feature_names
        ]


class AnomalyFeatureEngineer:
    """Validate and transform telemetry into anomaly features."""

    def __init__(
        self,
        feature_names: Sequence[str] = (
            ANOMALY_FEATURE_NAMES
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
    ) -> AnomalyFeatureSet:
        """Validate raw sensor/telemetry features."""

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
                    f"Invalid anomaly feature "
                    f"'{feature}': {exc}"
                ) from exc

        self._range_warning(
            values,
            "relative_humidity",
            0.0,
            100.0,
            warnings,
        )

        self._range_warning(
            values,
            "sensor_battery",
            0.0,
            100.0,
            warnings,
        )

        self._range_warning(
            values,
            "sensor_signal_quality",
            0.0,
            1.0,
            warnings,
        )

        if "z_score" in values:
            if abs(values["z_score"]) >= 3.0:
                warnings.append(
                    "z_score indicates a potentially unusual observation."
                )

        if "sensor_battery" in values:
            if values["sensor_battery"] < 20.0:
                warnings.append(
                    "Sensor battery level is low."
                )

        if "sensor_signal_quality" in values:
            if values[
                "sensor_signal_quality"
            ] < 0.5:
                warnings.append(
                    "Sensor signal quality is low."
                )

        if missing:
            warnings.append(
                "Some anomaly features are missing."
            )

        return AnomalyFeatureSet(
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