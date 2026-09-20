"""
Landslide model inference engine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    LANDSLIDE_FEATURE_NAMES,
    LandslideFeatureEngineer,
    LandslideFeatureSet,
)
from .model import LandslideModel


@dataclass
class LandslideInferenceResult:
    """Structured landslide inference response."""

    status: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    confidence: Optional[float]

    model_name: str
    model_version: str

    timestamp: str

    features: dict[str, Optional[float]] = field(
        default_factory=dict
    )
    feature_contributions: dict[str, float] = field(
        default_factory=dict
    )

    uncertainty: Optional[dict[str, Any]] = None

    missing_features: list[str] = field(default_factory=list)
    imputed_features: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "timestamp": self.timestamp,
            "features": self.features,
            "feature_contributions": self.feature_contributions,
            "uncertainty": self.uncertainty,
            "missing_features": self.missing_features,
            "imputed_features": self.imputed_features,
            "warnings": self.warnings,
        }


class LandslideInferenceEngine:
    """
    Runs landslide risk inference using a trained LandslideModel.

    Important:
    - This is a risk estimation layer, not a deterministic landslide predictor.
    - No numeric prediction is produced when a trained model is unavailable.
    - Risk bands are descriptive thresholds and should be calibrated against
      the actual model and deployment dataset before operational use.
    """

    DEFAULT_THRESHOLDS = {
        "low": 0.30,
        "moderate": 0.50,
        "high": 0.70,
    }

    def __init__(
        self,
        model: LandslideModel,
        feature_engineer: Optional[
            LandslideFeatureEngineer
        ] = None,
        thresholds: Optional[Mapping[str, float]] = None,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or LandslideFeatureEngineer()
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
                "Risk thresholds must satisfy "
                "0 <= low < moderate < high <= 1."
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
        feature_set: LandslideFeatureSet,
    ) -> Optional[float]:
        """
        Conservative confidence proxy.

        This is NOT a statistical confidence interval. A proper confidence
        estimate should come from model calibration/uncertainty methods.
        """

        if score is None:
            return None

        missing_count = len(feature_set.missing_features)
        imputed_count = len(feature_set.imputed_features)

        confidence = 1.0

        if missing_count:
            confidence -= min(
                0.50,
                missing_count / len(LANDSLIDE_FEATURE_NAMES) * 0.50,
            )

        if imputed_count:
            confidence -= min(
                0.25,
                imputed_count / len(LANDSLIDE_FEATURE_NAMES) * 0.25,
            )

        return max(0.0, min(1.0, confidence))

    def _feature_contributions(self) -> dict[str, float]:
        """Return raw model feature importance when available."""

        importance = self.model.feature_importance()

        if not importance:
            return {}

        return {
            name: round(value, 6)
            for name, value in importance.items()
        }

    def _build_result(
        self,
        *,
        status: str,
        feature_set: LandslideFeatureSet,
        score: Optional[float],
        warnings: list[str],
        uncertainty: Optional[dict[str, Any]] = None,
    ) -> LandslideInferenceResult:
        risk_level = (
            self._risk_level(score)
            if score is not None
            else None
        )

        confidence = self._confidence(
            score,
            feature_set,
        )

        return LandslideInferenceResult(
            status=status,
            risk_score=score,
            risk_level=risk_level,
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            features=feature_set.to_dict(),
            feature_contributions=self._feature_contributions(),
            uncertainty=uncertainty,
            missing_features=list(
                feature_set.missing_features
            ),
            imputed_features=list(
                feature_set.imputed_features
            ),
            warnings=warnings + list(
                feature_set.warnings
            ),
        )

    def predict(
        self,
        raw_features: Mapping[str, Any],
    ) -> LandslideInferenceResult:
        """Transform features and run landslide inference."""

        try:
            feature_set = self.feature_engineer.transform(
                raw_features
            )
        except (TypeError, ValueError) as exc:
            empty = LandslideFeatureSet()

            return self._build_result(
                status="invalid_features",
                feature_set=empty,
                score=None,
                warnings=[str(exc)],
            )

        if feature_set.missing_features:
            return self._build_result(
                status="missing_features",
                feature_set=feature_set,
                score=None,
                warnings=[
                    "Required model features are missing. "
                    "No risk score was generated."
                ],
            )

        try:
            vector = feature_set.vector(
                self.model.feature_names
                or LANDSLIDE_FEATURE_NAMES
            )
        except ValueError as exc:
            return self._build_result(
                status="feature_vector_error",
                feature_set=feature_set,
                score=None,
                warnings=[str(exc)],
            )

        prediction = self.model.predict_proba(vector)

        uncertainty = None

        if prediction.score is not None:
            uncertainty = {
                "type": "model_output_only",
                "note": (
                    "This is not a statistical confidence interval. "
                    "Use the uncertainty module for calibrated "
                    "intervals or probabilistic uncertainty."
                ),
            }

        return self._build_result(
            status=prediction.status,
            feature_set=feature_set,
            score=prediction.score,
            warnings=prediction.warnings,
            uncertainty=uncertainty,
        )

    def predict_from_features(
        self,
        feature_set: LandslideFeatureSet,
    ) -> LandslideInferenceResult:
        """Run inference from an already engineered feature set."""

        return self.predict(feature_set.to_dict())

    def health(self) -> dict[str, Any]:
        """Return engine health."""

        model_health = self.model.health()
        feature_health = self.feature_engineer.health()

        status = (
            "healthy"
            if model_health["loaded"]
            else "degraded"
        )

        return {
            "component": "landslide_inference_engine",
            "status": status,
            "model": model_health,
            "features": feature_health,
            "thresholds": dict(self.thresholds),
        }