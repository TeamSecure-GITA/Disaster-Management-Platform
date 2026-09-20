"""
Wildfire risk inference engine.

Important:
    This module estimates hazard/risk from supplied observations.
    It does not predict the exact location, time or occurrence of a future
    wildfire with certainty.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    WILDFIRE_FEATURE_NAMES,
    WildfireFeatureEngineer,
)
from .model import WildfireModel


@dataclass
class WildfireInferenceResult:
    """Structured wildfire inference response."""

    status: str

    risk_score: Optional[float]
    risk_level: Optional[str]
    confidence: Optional[float]

    model_name: str
    model_version: str
    task: str

    timestamp: str

    features: dict[str, float] = field(default_factory=dict)

    feature_contributions: dict[str, float] = field(
        default_factory=dict
    )

    uncertainty: dict[str, Any] = field(default_factory=dict)

    missing_features: list[str] = field(default_factory=list)
    imputed_features: list[str] = field(default_factory=list)

    warnings: list[str] = field(default_factory=list)

    deterministic_prediction: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Serialize the result."""

        return asdict(self)


class WildfireInferenceEngine:
    """
    Performs validated wildfire risk inference.

    Risk thresholds:
        < 0.30  -> low
        < 0.50  -> moderate
        < 0.70  -> high
        >= 0.70 -> very_high

    These are descriptive operational bands and should be calibrated against
    the project's actual validation dataset before deployment.
    """

    def __init__(
        self,
        model: WildfireModel,
        feature_engineer: Optional[WildfireFeatureEngineer] = None,
        low_threshold: float = 0.30,
        moderate_threshold: float = 0.50,
        high_threshold: float = 0.70,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or WildfireFeatureEngineer(
                feature_names=WILDFIRE_FEATURE_NAMES,
            )
        )

        self.low_threshold = low_threshold
        self.moderate_threshold = moderate_threshold
        self.high_threshold = high_threshold

        self._validate_thresholds()

    def _validate_thresholds(self) -> None:
        thresholds = (
            self.low_threshold,
            self.moderate_threshold,
            self.high_threshold,
        )

        if not all(0.0 < value < 1.0 for value in thresholds):
            raise ValueError(
                "Risk thresholds must be between 0 and 1."
            )

        if not (
            self.low_threshold
            < self.moderate_threshold
            < self.high_threshold
        ):
            raise ValueError(
                "Risk thresholds must be strictly increasing."
            )

    def _risk_level(self, score: float) -> str:
        """Convert probability/risk score to descriptive band."""

        if score < self.low_threshold:
            return "low"

        if score < self.moderate_threshold:
            return "moderate"

        if score < self.high_threshold:
            return "high"

        return "very_high"

    def _confidence(
        self,
        feature_count: int,
        missing_count: int,
        imputed_count: int,
    ) -> float:
        """
        Calculate a data-quality confidence indicator.

        This is NOT statistical model confidence.
        """

        if feature_count <= 0:
            return 0.0

        completeness = (
            max(feature_count - missing_count, 0)
            / feature_count
        )

        imputation_penalty = (
            min(imputed_count / feature_count, 1.0)
            * 0.25
        )

        confidence = completeness - imputation_penalty

        return round(
            max(0.0, min(1.0, confidence)),
            4,
        )

    def _feature_contributions(
        self,
        features: Mapping[str, float],
    ) -> dict[str, float]:
        """
        Return explainability-friendly feature importance.

        This reports model feature importance, not causal effects.
        """

        importance = self.model.feature_importance()

        if not importance:
            return {}

        return {
            feature: float(importance.get(feature, 0.0))
            for feature in features
            if feature in importance
        }

    def predict(
        self,
        observations: Mapping[str, Any],
    ) -> WildfireInferenceResult:
        """Run wildfire risk inference."""

        timestamp = datetime.now(timezone.utc).isoformat()

        base_warnings = [
            "Output represents wildfire hazard/risk estimation "
            "from supplied observations.",
            "It is not a deterministic prediction of a future wildfire.",
        ]

        if not self.model.is_loaded:
            return WildfireInferenceResult(
                status="model_not_loaded",
                risk_score=None,
                risk_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                warnings=base_warnings
                + [
                    "No trained wildfire estimator is loaded; "
                    "no risk score was generated."
                ],
                deterministic_prediction=False,
            )

        try:
            feature_set = self.feature_engineer.transform(
                observations
            )
        except ValueError as exc:
            return WildfireInferenceResult(
                status="invalid_features",
                risk_score=None,
                risk_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                warnings=base_warnings + [str(exc)],
                deterministic_prediction=False,
            )

        required_features = set(self.model.metadata.feature_names)

        if not required_features:
            required_features = set(
                self.feature_engineer.feature_names
            )

        missing_model_features = [
            feature
            for feature in required_features
            if feature not in feature_set.values
        ]

        if missing_model_features:
            return WildfireInferenceResult(
                status="insufficient_data",
                risk_score=None,
                risk_level=None,
                confidence=self._confidence(
                    len(required_features),
                    len(missing_model_features),
                    len(feature_set.imputed_features),
                ),
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing_model_features,
                imputed_features=feature_set.imputed_features,
                warnings=base_warnings
                + feature_set.warnings
                + [
                    "Required model features are missing. "
                    "No risk score was generated."
                ],
                deterministic_prediction=False,
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

        if prediction.probability is None:
            return WildfireInferenceResult(
                status="prediction_failed",
                risk_score=None,
                risk_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=feature_set.missing_features,
                imputed_features=feature_set.imputed_features,
                warnings=warnings
                + [
                    "The estimator did not provide a valid "
                    "positive-class probability."
                ],
                deterministic_prediction=False,
            )

        score = max(
            0.0,
            min(
                1.0,
                float(prediction.probability),
            ),
        )

        confidence = self._confidence(
            feature_count=len(self.model.metadata.feature_names),
            missing_count=len(feature_set.missing_features),
            imputed_count=len(feature_set.imputed_features),
        )

        contributions = self._feature_contributions(
            feature_set.values
        )

        uncertainty = {
            "type": "data_quality_indicator",
            "confidence_is_statistical": False,
            "confidence_note": (
                "Confidence reflects input completeness and explicit "
                "imputation, not calibrated probability uncertainty."
            ),
        }

        if not self.model.metadata.calibrated:
            uncertainty["calibration_warning"] = (
                "Model metadata does not indicate calibrated probabilities."
            )

            warnings.append(
                "Model probability calibration has not been confirmed."
            )

        return WildfireInferenceResult(
            status="success",
            risk_score=round(score, 6),
            risk_level=self._risk_level(score),
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            task=self.model.metadata.task,
            timestamp=timestamp,
            features=feature_set.values,
            feature_contributions=contributions,
            uncertainty=uncertainty,
            missing_features=feature_set.missing_features,
            imputed_features=feature_set.imputed_features,
            warnings=warnings,
            deterministic_prediction=False,
        )

    def health(self) -> dict[str, Any]:
        """Return inference engine health."""

        return {
            "model": self.model.health(),
            "feature_count": len(
                self.feature_engineer.feature_names
            ),
            "thresholds": {
                "low": self.low_threshold,
                "moderate": self.moderate_threshold,
                "high": self.high_threshold,
            },
            "deterministic_prediction": False,
        }