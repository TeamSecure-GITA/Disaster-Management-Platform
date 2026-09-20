"""
Prediction interval utilities.

Intervals are useful for continuous forecasts such as:
- rainfall
- river level
- temperature
- soil moisture
- sensor measurements

They should not be presented as guaranteed bounds unless the method
has been statistically validated for the relevant population.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional, Sequence


@dataclass
class PredictionInterval:
    """One prediction interval."""

    prediction: float

    lower: float

    upper: float

    level: float

    width: float


class PredictionIntervalCalculator:
    """
    Construct prediction intervals.

    Two modes are supported:

    1. Explicit interval:
       use externally calculated lower/upper values.

    2. Residual-based:
       use an empirical residual distribution supplied by the caller.
    """

    def __init__(
        self,
        default_level: float = 0.90,
    ) -> None:
        if not 0.0 < default_level < 1.0:
            raise ValueError(
                "Interval level must be between 0 and 1."
            )

        self.default_level = default_level

    def from_bounds(
        self,
        predictions: Sequence[float],
        lower: Sequence[float],
        upper: Sequence[float],
        level: Optional[float] = None,
    ) -> list[PredictionInterval]:
        """Create intervals from externally calculated bounds."""

        interval_level = (
            level
            if level is not None
            else self.default_level
        )

        self._validate_level(
            interval_level
        )

        if not (
            len(predictions)
            == len(lower)
            == len(upper)
        ):
            raise ValueError(
                "Predictions and interval bounds "
                "must have equal lengths."
            )

        results: list[
            PredictionInterval
        ] = []

        for prediction, low, high in zip(
            predictions,
            lower,
            upper,
        ):
            prediction = float(
                prediction
            )
            low = float(low)
            high = float(high)

            if low > high:
                raise ValueError(
                    "Lower interval bound cannot exceed upper bound."
                )

            results.append(
                PredictionInterval(
                    prediction=prediction,
                    lower=low,
                    upper=high,
                    level=interval_level,
                    width=high - low,
                )
            )

        return results

    def from_residuals(
        self,
        predictions: Sequence[float],
        residuals: Sequence[float],
        level: Optional[float] = None,
    ) -> list[PredictionInterval]:
        """
        Construct empirical residual intervals.

        Residuals should come from appropriate validation/calibration
        data rather than the same observations used to fit the model.
        """

        interval_level = (
            level
            if level is not None
            else self.default_level
        )

        self._validate_level(
            interval_level
        )

        if not residuals:
            raise ValueError(
                "Residuals are required."
            )

        sorted_residuals = sorted(
            float(value)
            for value in residuals
        )

        alpha = (
            1.0 - interval_level
        )

        lower_quantile = (
            alpha / 2.0
        )

        upper_quantile = (
            1.0 - alpha / 2.0
        )

        lower_residual = self._quantile(
            sorted_residuals,
            lower_quantile,
        )

        upper_residual = self._quantile(
            sorted_residuals,
            upper_quantile,
        )

        results: list[
            PredictionInterval
        ] = []

        for prediction in predictions:
            prediction = float(
                prediction
            )

            low = (
                prediction
                + lower_residual
            )

            high = (
                prediction
                + upper_residual
            )

            results.append(
                PredictionInterval(
                    prediction=prediction,
                    lower=low,
                    upper=high,
                    level=interval_level,
                    width=high - low,
                )
            )

        return results

    @staticmethod
    def _quantile(
        values: Sequence[float],
        probability: float,
    ) -> float:
        if not values:
            raise ValueError(
                "Cannot calculate quantile of empty sequence."
            )

        if probability <= 0:
            return float(values[0])

        if probability >= 1:
            return float(values[-1])

        position = (
            (len(values) - 1)
            * probability
        )

        lower_index = int(
            position
        )

        upper_index = min(
            lower_index + 1,
            len(values) - 1,
        )

        fraction = (
            position - lower_index
        )

        return (
            float(
                values[lower_index]
            )
            * (1.0 - fraction)
            + float(
                values[upper_index]
            )
            * fraction
        )

    @staticmethod
    def _validate_level(
        level: float,
    ) -> None:
        if not 0.0 < level < 1.0:
            raise ValueError(
                "Interval level must be between 0 and 1."
            )

    @staticmethod
    def summarize(
        intervals: Sequence[
            PredictionInterval
        ],
    ) -> dict[str, Any]:
        """Summarize interval statistics."""

        if not intervals:
            return {
                "count": 0,
                "mean_width": None,
            }

        mean_width = (
            sum(
                interval.width
                for interval in intervals
            )
            / len(intervals)
        )

        return {
            "count": len(intervals),
            "mean_width": round(
                mean_width,
                6,
            ),
            "level": intervals[0].level,
        }