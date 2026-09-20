"""
Cyclone-risk inference engine.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    CYCLONE_FEATURE_NAMES,
    CycloneFeatureEngineer,
    CycloneFeatureSet,
)
from .model import CycloneModel


@dataclass
class CycloneInferenceResult:
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
            "timestamp": self.timestamp,
            "features": self.features,
            "feature_contributions": self.feature_contributions,
            "uncertainty": self.uncertainty,
            "missing_features": self.missing_features,
            "imputed_features": self.imputed_features,
            "warnings": self.warnings,
        }


class CycloneInferenceEngine:
    """
    Estimate cyclone-related risk using a trained model.

    This component does not generate deterministic cyclone-track,
    landfall, or formation predictions.
    """

    DEFAULT_THRESHOLDS = {
        "low": 0.30,
        "moderate": 0.50,
        "high": 0.70,
    }

    def __init__(
        self,
        model: CycloneModel,
        feature_engineer: Optional[
            CycloneFeatureEngineer
        ] = None,
        thresholds: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.model = model
        self.feature_engineer = (
            feature_engineer
            or CycloneFeatureEngineer()
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
                "Invalid cyclone risk thresholds."
            )

    def _level(
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
        features: CycloneFeatureSet,
    ) -> Optional[float]:
        if score is None:
            return None

        total = len(CYCLONE_FEATURE_NAMES)
        confidence = 1.0

        if features.missing_features:
            confidence -= min(
                0.50,
                len(features.missing_features)
                / total
                * 0.50,
            )

        if features.imputed_features:
            confidence -= min(
                0.25,
                len(features.imputed_features)
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
    ) -> CycloneInferenceResult:
        try:
            features = self.feature_engineer.transform(
                raw_features
            )
        except (TypeError, ValueError) as exc:
            return self._result(
                status="invalid_features",
                features=CycloneFeatureSet(),
                score=None,
                warnings=[str(exc)],
            )

        if features.missing_features:
            return self._result(
                status="missing_features",
                features=features,
                score=None,
                warnings=[
                    "Required cyclone-model features "
                    "are missing. No risk score generated."
                ],
            )

        try:
            vector = features.vector(
                self.model.feature_names
                or CYCLONE_FEATURE_NAMES
            )
        except ValueError as exc:
            return self._result(
                status="feature_vector_error",
                features=features,
                score=None,
                warnings=[str(exc)],
            )

        prediction = self.model.predict_proba(vector)

        uncertainty = None

        if prediction.score is not None:
            uncertainty = {
                "type": "model_output_only",
                "note": (
                    "This is not a statistical confidence "
                    "interval or forecast-track probability."
                ),
            }

        return self._result(
            status=prediction.status,
            features=features,
            score=prediction.score,
            warnings=prediction.warnings,
            uncertainty=uncertainty,
        )

    def _result(
        self,
        *,
        status: str,
        features: CycloneFeatureSet,
        score: Optional[float],
        warnings: list[str],
        uncertainty: Optional[
            dict[str, Any]
        ] = None,
    ) -> CycloneInferenceResult:
        level = (
            self._level(score)
            if score is not None
            else None
        )

        confidence = self._confidence(
            score,
            features,
        )

        return CycloneInferenceResult(
            status=status,
            risk_score=score,
            risk_level=level,
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            features=features.to_dict(),
            feature_contributions={
                name: round(value, 6)
                for name, value in
                self.model.feature_importance().items()
            },
            uncertainty=uncertainty,
            missing_features=list(
                features.missing_features
            ),
            imputed_features=list(
                features.imputed_features
            ),
            warnings=warnings + list(
                features.warnings
            ),
        )

    def health(self) -> dict[str, Any]:
        model_health = self.model.health()
        feature_health = (
            self.feature_engineer.health()
        )

        return {
            "component": "cyclone_inference_engine",
            "status": (
                "healthy"
                if model_health["loaded"]
                else "degraded"
            ),
            "model": model_health,
            "features": feature_health,
            "thresholds": dict(self.thresholds),
        }