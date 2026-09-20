"""
Earthquake/seismic inference engine.

The engine supports event detection and hazard/risk estimation. It does NOT
claim deterministic prediction of future earthquakes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    EARTHQUAKE_FEATURE_NAMES,
    EarthquakeFeatureEngineer,
    EarthquakeFeatureSet,
)
from .model import EarthquakeModel


@dataclass
class EarthquakeInferenceResult:
    status: str

    risk_score: Optional[float]
    risk_level: Optional[str]
    confidence: Optional[float]

    model_name: str
    model_version: str
    model_task: str

    timestamp: str

    features: dict[str, Optional[float]] = field(
        default_factory=dict
    )

    feature_contributions: dict[str, float] = field(
        default_factory=dict
    )

    uncertainty: Optional[
        dict[str, Any]
    ] = None

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
            "status": self.status,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "model_task": self.model_task,
            "timestamp": self.timestamp,
            "features": self.features,
            "feature_contributions": (
                self.feature_contributions
            ),
            "uncertainty": self.uncertainty,
            "missing_features": (
                self.missing_features
            ),
            "imputed_features": (
                self.imputed_features
            ),
            "warnings": self.warnings,
        }


class EarthquakeInferenceEngine:
    """
    Earthquake model inference.

    Supported interpretation:
        observed seismic signal -> event/hazard model -> score

    Unsupported interpretation:
        current signal -> exact future earthquake prediction

    The latter is deliberately not implemented.
    """

    DEFAULT_THRESHOLDS = {
        "low": 0.30,
        "moderate": 0.50,
        "high": 0.70,
    }

    def __init__(
        self,
        model: EarthquakeModel,
        feature_engineer: Optional[
            EarthquakeFeatureEngineer
        ] = None,
        thresholds: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or EarthquakeFeatureEngineer()
        )

        self.thresholds = dict(
            thresholds or self.DEFAULT_THRESHOLDS
        )

        self._validate_thresholds()

    def _validate_thresholds(self) -> None:
        low = self.thresholds["low"]
        moderate = self.thresholds["moderate"]
        high = self.thresholds["high"]

        if not (
            0.0 <= low < moderate < high <= 1.0
        ):
            raise ValueError(
                "Invalid earthquake risk thresholds."
            )

    def _risk_level(
        self,
        score: float,
    ) -> str:
        if score < self.thresholds["low"]:
            return "low"

        if score < self.thresholds["moderate"]:
            return "moderate"

        if score < self.thresholds["high"]:
            return "high"

        return "very_high"

    def _confidence(
        self,
        score: Optional[float],
        features: EarthquakeFeatureSet,
    ) -> Optional[float]:
        """
        Data-quality indicator, not statistical confidence.

        A production deployment should replace this with calibrated model
        uncertainty or an appropriate probabilistic method.
        """

        if score is None:
            return None

        total = len(
            EARTHQUAKE_FEATURE_NAMES
        )

        confidence = 1.0

        if features.missing_features:
            confidence -= min(
                0.50,
                len(
                    features.missing_features
                )
                / total
                * 0.50,
            )

        if features.imputed_features:
            confidence -= min(
                0.25,
                len(
                    features.imputed_features
                )
                / total
                * 0.25,
            )

        return max(
            0.0,
            min(1.0, confidence),
        )

    def predict(
        self,
        raw_features: Mapping[str, Any],
    ) -> EarthquakeInferenceResult:
        """
        Analyze supplied seismic observations.

        This method does not forecast an exact future earthquake.
        """

        try:
            features = (
                self.feature_engineer.transform(
                    raw_features
                )
            )

        except (
            TypeError,
            ValueError,
        ) as exc:
            return self._result(
                status="invalid_features",
                features=EarthquakeFeatureSet(),
                score=None,
                warnings=[str(exc)],
            )

        if features.missing_features:
            return self._result(
                status="missing_features",
                features=features,
                score=None,
                warnings=[
                    "Required seismic model features "
                    "are missing. No score was generated."
                ],
            )

        try:
            vector = features.vector(
                self.model.feature_names
                or EARTHQUAKE_FEATURE_NAMES
            )

        except ValueError as exc:
            return self._result(
                status="feature_vector_error",
                features=features,
                score=None,
                warnings=[str(exc)],
            )

        prediction = (
            self.model.predict_proba(vector)
        )

        warnings = list(
            prediction.warnings
        )

        warnings.append(
            "Model output represents event/hazard analysis "
            "from supplied observations; it is not a "
            "deterministic earthquake forecast."
        )

        uncertainty = None

        if prediction.score is not None:
            uncertainty = {
                "type": "model_output_only",
                "note": (
                    "No calibrated statistical interval is "
                    "provided by this layer."
                ),
            }

        return self._result(
            status=prediction.status,
            features=features,
            score=prediction.score,
            warnings=warnings,
            uncertainty=uncertainty,
        )

    def _result(
        self,
        *,
        status: str,
        features: EarthquakeFeatureSet,
        score: Optional[float],
        warnings: list[str],
        uncertainty: Optional[
            dict[str, Any]
        ] = None,
    ) -> EarthquakeInferenceResult:
        level = (
            self._risk_level(score)
            if score is not None
            else None
        )

        confidence = self._confidence(
            score,
            features,
        )

        return EarthquakeInferenceResult(
            status=status,
            risk_score=score,
            risk_level=level,
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=(
                self.model.metadata.version
            ),
            model_task=self.model.metadata.task,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            features=features.to_dict(),
            feature_contributions={
                name: round(value, 6)
                for name, value in (
                    self.model.feature_importance()
                    .items()
                )
            },
            uncertainty=uncertainty,
            missing_features=list(
                features.missing_features
            ),
            imputed_features=list(
                features.imputed_features
            ),
            warnings=(
                warnings
                + list(features.warnings)
            ),
        )

    def health(self) -> dict[str, Any]:
        model_health = self.model.health()

        feature_health = (
            self.feature_engineer.health()
        )

        return {
            "component": (
                "earthquake_inference_engine"
            ),
            "status": (
                "healthy"
                if model_health["loaded"]
                else "degraded"
            ),
            "model": model_health,
            "features": feature_health,
            "thresholds": dict(
                self.thresholds
            ),
            "deterministic_prediction": False,
        }