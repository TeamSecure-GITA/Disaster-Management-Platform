"""
Multi-hazard inference engine.

Combines validated hazard indicators and/or a trained multi-hazard model.

Important:
    A combined risk score is not an assertion that multiple disasters
    will occur simultaneously.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    MULTI_HAZARD_FEATURE_NAMES,
    MultiHazardFeatureEngineer,
)
from .model import MultiHazardModel


@dataclass
class MultiHazardInferenceResult:
    """Structured multi-hazard inference response."""

    status: str

    risk_score: Optional[float]
    risk_level: Optional[str]
    confidence: Optional[float]

    model_name: str
    model_version: str
    task: str

    timestamp: str

    features: dict[str, float] = field(
        default_factory=dict
    )

    feature_contributions: dict[str, float] = field(
        default_factory=dict
    )

    active_hazards: list[str] = field(
        default_factory=list
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


class MultiHazardInferenceEngine:
    """
    Multi-hazard inference engine.

    Risk bands:
        < 0.30  -> low
        < 0.50  -> moderate
        < 0.70  -> high
        >= 0.70 -> very_high

    These bands should be calibrated using project-specific validation
    data before operational deployment.
    """

    HAZARD_FEATURES = (
        "landslide_risk",
        "flood_risk",
        "cyclone_risk",
        "earthquake_risk",
        "wildfire_risk",
    )

    def __init__(
        self,
        model: MultiHazardModel,
        feature_engineer: Optional[
            MultiHazardFeatureEngineer
        ] = None,
        low_threshold: float = 0.30,
        moderate_threshold: float = 0.50,
        high_threshold: float = 0.70,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or MultiHazardFeatureEngineer(
                feature_names=(
                    self.model.metadata.feature_names
                    or MULTI_HAZARD_FEATURE_NAMES
                )
            )
        )

        self.low_threshold = low_threshold
        self.moderate_threshold = (
            moderate_threshold
        )
        self.high_threshold = high_threshold

        self._validate_thresholds()

    def _validate_thresholds(self) -> None:
        if not (
            0.0
            < self.low_threshold
            < self.moderate_threshold
            < self.high_threshold
            < 1.0
        ):
            raise ValueError(
                "Risk thresholds must satisfy "
                "0 < low < moderate < high < 1."
            )

    def _risk_level(
        self,
        score: float,
    ) -> str:
        if score < self.low_threshold:
            return "low"

        if score < self.moderate_threshold:
            return "moderate"

        if score < self.high_threshold:
            return "high"

        return "very_high"

    def _active_hazards(
        self,
        values: Mapping[str, float],
    ) -> list[str]:
        """
        Identify supplied hazard indicators at or above
        the moderate threshold.

        This describes supplied model/indicator values; it does not
        independently detect disasters.
        """

        active: list[str] = []

        for feature in self.HAZARD_FEATURES:
            if feature not in values:
                continue

            if values[feature] >= self.moderate_threshold:
                active.append(
                    feature.removesuffix("_risk")
                )

        return active

    def _confidence(
        self,
        total: int,
        missing: int,
    ) -> float:
        """Return input-completeness confidence indicator."""

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

    def _feature_contributions(
        self,
        values: Mapping[str, float],
    ) -> dict[str, float]:
        """Return model feature importance."""

        importance = (
            self.model.feature_importance()
        )

        if not importance:
            return {}

        return {
            name: float(importance.get(name, 0.0))
            for name in values
            if name in importance
        }

    def predict(
        self,
        observations: Mapping[str, Any],
    ) -> MultiHazardInferenceResult:
        """Run multi-hazard inference."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        base_warnings = [
            (
                "The result represents aggregated "
                "multi-hazard risk estimation."
            ),
            (
                "It does not mean that all listed hazards "
                "will occur simultaneously."
            ),
            (
                "It is not a deterministic prediction "
                "of future disasters."
            ),
        ]

        if not self.model.is_loaded:
            return MultiHazardInferenceResult(
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
                    (
                        "No trained multi-hazard estimator "
                        "is loaded; no aggregate risk score "
                        "was generated."
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
            return MultiHazardInferenceResult(
                status="invalid_features",
                risk_score=None,
                risk_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
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
            return MultiHazardInferenceResult(
                status="insufficient_data",
                risk_score=None,
                risk_level=None,
                confidence=self._confidence(
                    len(required_features),
                    len(missing),
                ),
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                active_hazards=self._active_hazards(
                    feature_set.values
                ),
                missing_features=missing,
                warnings=base_warnings
                + feature_set.warnings
                + [
                    (
                        "Required multi-hazard features "
                        "are missing. No aggregate score "
                        "was generated."
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

        if prediction.probability is None:
            return MultiHazardInferenceResult(
                status="prediction_failed",
                risk_score=None,
                risk_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                active_hazards=self._active_hazards(
                    feature_set.values
                ),
                missing_features=missing,
                warnings=warnings
                + [
                    (
                        "The estimator did not return "
                        "a valid aggregate probability."
                    )
                ],
            )

        score = max(
            0.0,
            min(
                1.0,
                float(prediction.probability),
            ),
        )

        confidence = self._confidence(
            len(required_features),
            len(missing),
        )

        uncertainty = {
            "type": "input_completeness",
            "confidence_is_statistical": False,
            "confidence_note": (
                "Confidence measures input completeness; "
                "it is not calibrated statistical uncertainty."
            ),
            "hazard_models_should_retain_individual_uncertainty": True,
        }

        if not self.model.metadata.calibrated:
            warnings.append(
                (
                    "Aggregate model probability calibration "
                    "has not been confirmed."
                )
            )

            uncertainty["calibration_warning"] = True

        return MultiHazardInferenceResult(
            status="success",
            risk_score=round(score, 6),
            risk_level=self._risk_level(score),
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            task=self.model.metadata.task,
            timestamp=timestamp,
            features=feature_set.values,
            feature_contributions=(
                self._feature_contributions(
                    feature_set.values
                )
            ),
            active_hazards=self._active_hazards(
                feature_set.values
            ),
            uncertainty=uncertainty,
            missing_features=missing,
            warnings=warnings,
            deterministic_prediction=False,
        )

    def health(self) -> dict[str, Any]:
        """Return engine health."""

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
            "supported_hazards": [
                "landslide",
                "flood",
                "cyclone",
                "earthquake",
                "wildfire",
            ],
            "deterministic_prediction": False,
        }