"""
Damage detection inference engine.

Produces structured damage classifications from validated features.

The result is an assessment signal and should be independently verified
for high-impact operational decisions.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    DAMAGE_FEATURE_NAMES,
    DamageFeatureEngineer,
)
from .model import DamageDetectionModel


@dataclass
class DamageDetectionResult:
    """Structured damage assessment result."""

    status: str

    damage_class: Optional[str]

    class_probabilities: dict[str, float]

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

    uncertainty: dict[str, Any] = field(
        default_factory=dict
    )

    missing_features: list[str] = field(
        default_factory=list
    )

    warnings: list[str] = field(
        default_factory=list
    )

    requires_field_verification: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class DamageDetectionInferenceEngine:
    """
    Run damage assessment.

    High-impact damage classifications are explicitly marked for
    field verification rather than being treated as ground truth.
    """

    HIGH_IMPACT_CLASSES = {
        "severe",
        "destroyed",
    }

    def __init__(
        self,
        model: DamageDetectionModel,
        feature_engineer: Optional[
            DamageFeatureEngineer
        ] = None,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or DamageFeatureEngineer(
                feature_names=(
                    self.model.metadata.feature_names
                    or DAMAGE_FEATURE_NAMES
                )
            )
        )

    def _confidence(
        self,
        total: int,
        missing: int,
    ) -> float:
        """Input completeness indicator."""

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
            name: float(
                importance.get(
                    name,
                    0.0,
                )
            )
            for name in values
            if name in importance
        }

    def predict(
        self,
        observations: Mapping[str, Any],
    ) -> DamageDetectionResult:
        """Run damage assessment."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        base_warnings = [
            (
                "This output is an automated damage assessment "
                "from supplied features."
            ),
            (
                "It should not be treated as ground truth "
                "without appropriate verification."
            ),
        ]

        if not self.model.is_loaded:
            return DamageDetectionResult(
                status="model_not_loaded",
                damage_class=None,
                class_probabilities={},
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                warnings=base_warnings
                + [
                    (
                        "No damage detection model is loaded; "
                        "no assessment was generated."
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
            return DamageDetectionResult(
                status="invalid_features",
                damage_class=None,
                class_probabilities={},
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
            return DamageDetectionResult(
                status="insufficient_data",
                damage_class=None,
                class_probabilities={},
                confidence=self._confidence(
                    len(required_features),
                    len(missing),
                ),
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing,
                warnings=base_warnings
                + feature_set.warnings
                + [
                    (
                        "Required damage-assessment features "
                        "are missing."
                    )
                ],
            )

        ordered_features = [
            feature_set.values[name]
            for name in self.model.metadata.feature_names
        ]

        prediction = (
            self.model.predict_result(
                ordered_features
            )
        )

        warnings = (
            base_warnings
            + feature_set.warnings
            + prediction.warnings
        )

        if prediction.predicted_class is None:
            return DamageDetectionResult(
                status="prediction_failed",
                damage_class=None,
                class_probabilities=(
                    prediction.class_probabilities
                ),
                confidence=prediction.confidence,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing,
                warnings=warnings
                + [
                    (
                        "The estimator did not return "
                        "a damage classification."
                    )
                ],
            )

        requires_verification = (
            prediction.predicted_class
            in self.HIGH_IMPACT_CLASSES
        )

        if requires_verification:
            warnings.append(
                (
                    "High-impact damage classification detected. "
                    "Field or independent imagery verification is "
                    "recommended before consequential action."
                )
            )

        uncertainty = {
            "confidence_is_statistical": (
                prediction.class_probabilities
                != {}
            ),
            "probability_calibration_confirmed": (
                self.model.metadata.calibrated
            ),
            "field_verification_required_for_high_impact": True,
        }

        if not self.model.metadata.calibrated:
            warnings.append(
                (
                    "Model probability calibration has not "
                    "been confirmed in metadata."
                )
            )

        return DamageDetectionResult(
            status="success",
            damage_class=(
                prediction.predicted_class
            ),
            class_probabilities=(
                prediction.class_probabilities
            ),
            confidence=prediction.confidence,
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
            uncertainty=uncertainty,
            missing_features=missing,
            warnings=warnings,
            requires_field_verification=(
                requires_verification
            ),
        )

    def health(self) -> dict[str, Any]:
        """Return damage detection engine health."""

        return {
            "model": self.model.health(),
            "feature_count": len(
                self.feature_engineer.feature_names
            ),
            "damage_classes": (
                self.model.metadata.classes
            ),
            "high_impact_classes": sorted(
                self.HIGH_IMPACT_CLASSES
            ),
            "field_verification_supported": True,
        }