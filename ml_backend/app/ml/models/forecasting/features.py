"""
Feature engineering for environmental time-series forecasting.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Mapping, Optional, Sequence


FORECAST_FEATURE_NAMES: tuple[str, ...] = (
    "current_value",
    "lag_1",
    "lag_2",
    "lag_3",
    "lag_6",
    "lag_12",
    "lag_24",
    "rolling_mean_3",
    "rolling_mean_6",
    "rolling_mean_12",
    "rolling_mean_24",
    "rolling_std_6",
    "rolling_std_24",
    "trend",
    "rate_of_change",
    "rainfall_24h",
    "rainfall_7d",
    "temperature",
    "relative_humidity",
    "wind_speed",
    "river_level",
    "soil_moisture",
)


FEATURE_ALIASES: dict[
    str,
    tuple[str, ...],
] = {
    "current_value": (
        "value",
        "current",
        "measurement",
        "latest_value",
    ),
    "lag_1": (
        "previous_value",
        "previous_1",
        "lag1",
    ),
    "lag_2": (
        "previous_2",
        "lag2",
    ),
    "lag_3": (
        "previous_3",
        "lag3",
    ),
    "lag_6": (
        "previous_6",
        "lag6",
    ),
    "lag_12": (
        "previous_12",
        "lag12",
    ),
    "lag_24": (
        "previous_24",
        "lag24",
    ),
    "rolling_mean_3": (
        "mean_3",
        "moving_average_3",
    ),
    "rolling_mean_6": (
        "mean_6",
        "moving_average_6",
    ),
    "rolling_mean_12": (
        "mean_12",
        "moving_average_12",
    ),
    "rolling_mean_24": (
        "mean_24",
        "moving_average_24",
    ),
    "rolling_std_6": (
        "std_6",
        "moving_std_6",
    ),
    "rolling_std_24": (
        "std_24",
        "moving_std_24",
    ),
    "trend": (
        "trend_value",
        "trend_slope",
    ),
    "rate_of_change": (
        "roc",
        "change_rate",
    ),
    "rainfall_24h": (
        "rain_24h",
        "precipitation_24h",
    ),
    "rainfall_7d": (
        "rain_7d",
        "precipitation_7d",
    ),
    "temperature": (
        "temperature_c",
        "air_temperature",
    ),
    "relative_humidity": (
        "humidity",
        "relative_humidity_pct",
    ),
    "wind_speed": (
        "wind_speed_mps",
        "wind",
    ),
    "river_level": (
        "water_level",
        "river_height",
    ),
    "soil_moisture": (
        "soil_water_content",
        "moisture",
    ),
}


@dataclass
class ForecastFeatureSet:
    """Validated forecast feature set."""

    values: dict[str, float]

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    feature_names: tuple[str, ...] = (
        FORECAST_FEATURE_NAMES
    )

    @property
    def vector(self) -> list[float]:
        return [
            self.values[name]
            for name in self.feature_names
        ]


class ForecastFeatureEngineer:
    """Validate and transform time-series forecast features."""

    def __init__(
        self,
        feature_names: Sequence[str] = (
            FORECAST_FEATURE_NAMES
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
    ) -> ForecastFeatureSet:
        """Validate forecast inputs."""

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
                    f"Invalid forecast feature "
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
            "rainfall_24h",
            0.0,
            None,
            warnings,
        )

        self._range_warning(
            values,
            "rainfall_7d",
            0.0,
            None,
            warnings,
        )

        if missing:
            warnings.append(
                "Some forecast input features are missing."
            )

        return ForecastFeatureSet(
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