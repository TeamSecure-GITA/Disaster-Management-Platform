"""
Forecast inference engine.

Provides structured forecasts with:
- Forecast values
- Prediction intervals when available
- Horizon metadata
- Input completeness
- Warnings
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    FORECAST_FEATURE_NAMES,
    ForecastFeatureEngineer,
)
from .model import ForecastModel


@dataclass
class ForecastInferenceResult:
    """Structured forecasting response."""

    status: str

    forecast: list[float]

    lower_bounds: Optional[list[float]]
    upper_bounds: Optional[list[float]]

    confidence: Optional[float]

    model_name: str
    model_version: str
    task: str

    target: str
    horizon_steps: int

    timestamp: str

    features: dict[str, float] = field(
        default_factory=dict
    )

    uncertainty: dict[str, Any] = field(
        default_factory=dict
    )

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    deterministic_prediction: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ForecastInferenceEngine:
    """Run validated time-series forecasting."""

    def __init__(
        self,
        model: ForecastModel,
        feature_engineer: Optional[
            ForecastFeatureEngineer
        ] = None,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or ForecastFeatureEngineer(
                feature_names=(
                    self.model.metadata.feature_names
                    or FORECAST_FEATURE_NAMES
                )
            )
        )

    def _confidence(
        self,
        total: int,
        missing: int,
    ) -> float:
        """
        Input completeness indicator.

        This is NOT forecast probability or statistical confidence.
        """

        if total <= 0:
            return 0.0

        return round(
            max(
                0.0,
                min(
                    1.0,
                    (total - missing) / total,
                ),
            ),
            4,
        )

    def predict(
        self,
        observations: Mapping[str, Any],
    ) -> ForecastInferenceResult:
        """Generate a forecast."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        base_warnings = [
            (
                "Forecast values are model estimates, "
                "not guarantees."
            ),
            (
                "Forecast reliability depends on historical "
                "data quality, model validation and horizon."
            ),
        ]

        if not self.model.is_loaded:
            return ForecastInferenceResult(
                status="model_not_loaded",
                forecast=[],
                lower_bounds=None,
                upper_bounds=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                target=self.model.metadata.target,
                horizon_steps=(
                    self.model.metadata.forecast_horizon_steps
                ),
                timestamp=timestamp,
                warnings=base_warnings
                + [
                    (
                        "No forecasting model is loaded; "
                        "no forecast was generated."
                    )
                ],
            )

        try:
            feature_set = (
                self.feature_engineer.transform(
                    observations
                )
            )
        except ValueError as exc:
            return ForecastInferenceResult(
                status="invalid_features",
                forecast=[],
                lower_bounds=None,
                upper_bounds=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                target=self.model.metadata.target,
                horizon_steps=(
                    self.model.metadata.forecast_horizon_steps
                ),
                timestamp=timestamp,
                warnings=base_warnings + [str(exc)],
            )

        required_features = set(
            self.model.metadata.feature_names
        )

        if not required_features:
            required_features = set(
                self.feature_engineer.feature_names
            )

        missing = [
            feature
            for feature in required_features
            if feature not in feature_set.values
        ]

        if missing:
            return ForecastInferenceResult(
                status="insufficient_data",
                forecast=[],
                lower_bounds=None,
                upper_bounds=None,
                confidence=self._confidence(
                    len(required_features),
                    len(missing),
                ),
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                target=self.model.metadata.target,
                horizon_steps=(
                    self.model.metadata.forecast_horizon_steps
                ),
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing,
                warnings=base_warnings
                + feature_set.warnings
                + [
                    (
                        "Required forecasting features "
                        "are missing; no forecast was generated."
                    )
                ],
            )

        ordered_features = [
            feature_set.values[name]
            for name in self.model.metadata.feature_names
        ]

        prediction = self.model.predict_result(
            ordered_features
        )

        warnings = (
            base_warnings
            + feature_set.warnings
            + prediction.warnings
        )

        if not prediction.values:
            return ForecastInferenceResult(
                status="prediction_failed",
                forecast=[],
                lower_bounds=None,
                upper_bounds=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                target=self.model.metadata.target,
                horizon_steps=(
                    self.model.metadata.forecast_horizon_steps
                ),
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing,
                warnings=warnings
                + [
                    (
                        "The forecasting estimator did not "
                        "return valid forecast values."
                    )
                ],
            )

        confidence = self._confidence(
            len(required_features),
            len(missing),
        )

        uncertainty: dict[str, Any] = {
            "prediction_interval_available": (
                prediction.lower_bounds
                is not None
                and prediction.upper_bounds
                is not None
            ),
            "confidence_is_statistical": False,
            "confidence_note": (
                "Confidence reflects input completeness, "
                "not calibrated forecast probability."
            ),
        }

        if (
            prediction.lower_bounds is None
            or prediction.upper_bounds is None
        ):
            uncertainty["warning"] = (
                "The selected model did not provide "
                "a calibrated prediction interval."
            )

        if not self.model.metadata.calibrated:
            warnings.append(
                (
                    "Forecast calibration has not been "
                    "confirmed in model metadata."
                )
            )

            uncertainty[
                "calibration_warning"
            ] = True

        return ForecastInferenceResult(
            status="success",
            forecast=prediction.values,
            lower_bounds=prediction.lower_bounds,
            upper_bounds=prediction.upper_bounds,
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            task=self.model.metadata.task,
            target=self.model.metadata.target,
            horizon_steps=(
                self.model.metadata.forecast_horizon_steps
            ),
            timestamp=timestamp,
            features=feature_set.values,
            uncertainty=uncertainty,
            missing_features=missing,
            warnings=warnings,
            deterministic_prediction=False,
        )

    def health(self) -> dict[str, Any]:
        """Return forecast engine health."""

        return {
            "model": self.model.health(),
            "feature_count": len(
                self.feature_engineer.feature_names
            ),
            "forecast_horizon_steps": (
                self.model.metadata.forecast_horizon_steps
            ),
            "deterministic_prediction": False,
        }