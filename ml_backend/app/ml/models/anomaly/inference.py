"""
Anomaly inference engine.

An anomaly is treated as a signal for investigation rather than proof
of a disaster, sensor failure, or physical event.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from .features import (
    ANOMALY_FEATURE_NAMES,
    AnomalyFeatureEngineer,
)
from .model import AnomalyModel


@dataclass
class AnomalyInferenceResult:
    """Structured anomaly detection result."""

    status: str

    is_anomaly: Optional[bool]
    anomaly_score: Optional[float]

    anomaly_level: Optional[str]

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

    requires_investigation: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class AnomalyInferenceEngine:
    """
    Run anomaly detection against validated observations.

    The anomaly score is model-specific.

    Therefore:
        - it is not automatically converted into probability;
        - it should not be interpreted as disaster probability;
        - the threshold must be calibrated for the selected estimator.
    """

    def __init__(
        self,
        model: AnomalyModel,
        feature_engineer: Optional[
            AnomalyFeatureEngineer
        ] = None,
        investigation_threshold: float = 0.70,
    ) -> None:
        self.model = model

        self.feature_engineer = (
            feature_engineer
            or AnomalyFeatureEngineer(
                feature_names=(
                    self.model.metadata.feature_names
                    or ANOMALY_FEATURE_NAMES
                )
            )
        )

        if not (
            0.0
            < investigation_threshold
            <= 1.0
        ):
            raise ValueError(
                "Investigation threshold must be in (0, 1]."
            )

        self.investigation_threshold = (
            investigation_threshold
        )

    def _confidence(
        self,
        total: int,
        missing: int,
    ) -> float:
        """Input completeness indicator, not statistical confidence."""

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

    def _anomaly_level(
        self,
        is_anomaly: Optional[bool],
        score: Optional[float],
    ) -> Optional[str]:
        """
        Classify anomaly severity.

        The score interpretation depends on the underlying model.
        """

        if is_anomaly is False:
            return "normal"

        if is_anomaly is None:
            return None

        if score is None:
            return "anomalous"

        # Generic normalized score handling.
        normalized = abs(float(score))

        if normalized >= 0.90:
            return "critical"

        if normalized >= 0.75:
            return "high"

        return "moderate"

    def predict(
        self,
        observations: Mapping[str, Any],
    ) -> AnomalyInferenceResult:
        """Run anomaly inference."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        base_warnings = [
            (
                "An anomaly is a statistical deviation "
                "from the model's learned/reference pattern."
            ),
            (
                "An anomaly does not by itself prove a disaster "
                "or physical hazard."
            ),
            (
                "Sensor malfunction and genuine environmental "
                "events can both produce anomalies."
            ),
        ]

        if not self.model.is_loaded:
            return AnomalyInferenceResult(
                status="model_not_loaded",
                is_anomaly=None,
                anomaly_score=None,
                anomaly_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                warnings=base_warnings
                + [
                    (
                        "No anomaly detector is loaded; "
                        "no anomaly result was generated."
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
            return AnomalyInferenceResult(
                status="invalid_features",
                is_anomaly=None,
                anomaly_score=None,
                anomaly_level=None,
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
            return AnomalyInferenceResult(
                status="insufficient_data",
                is_anomaly=None,
                anomaly_score=None,
                anomaly_level=None,
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
                        "Required anomaly features are missing; "
                        "no anomaly decision was generated."
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

        if (
            prediction.is_anomaly is None
            and prediction.anomaly_score is None
        ):
            return AnomalyInferenceResult(
                status="prediction_failed",
                is_anomaly=None,
                anomaly_score=None,
                anomaly_level=None,
                confidence=None,
                model_name=self.model.metadata.name,
                model_version=self.model.metadata.version,
                task=self.model.metadata.task,
                timestamp=timestamp,
                features=feature_set.values,
                missing_features=missing,
                warnings=warnings
                + [
                    (
                        "The anomaly estimator did not return "
                        "a usable result."
                    )
                ],
            )

        is_anomaly = prediction.is_anomaly
        score = prediction.anomaly_score

        # If the estimator provides only a score, we deliberately
        # do NOT invent a universal threshold because anomaly-score
        # semantics vary by algorithm.
        if (
            is_anomaly is None
            and score is not None
        ):
            warnings.append(
                (
                    "Only a model-specific anomaly score was returned. "
                    "No universal anomaly threshold was applied."
                )
            )

        level = self._anomaly_level(
            is_anomaly,
            score,
        )

        requires_investigation = (
            is_anomaly is True
        )

        if requires_investigation:
            warnings.append(
                (
                    "Anomalous observation should be investigated "
                    "against sensor health, nearby sensors, and "
                    "independent hazard data."
                )
            )

        confidence = self._confidence(
            len(required_features),
            len(missing),
        )

        uncertainty = {
            "type": "model_specific_anomaly_score",
            "confidence_is_statistical": False,
            "note": (
                "Anomaly-score semantics depend on the selected "
                "algorithm and training/reference distribution."
            ),
        }

        return AnomalyInferenceResult(
            status="success",
            is_anomaly=is_anomaly,
            anomaly_score=score,
            anomaly_level=level,
            confidence=confidence,
            model_name=self.model.metadata.name,
            model_version=self.model.metadata.version,
            task=self.model.metadata.task,
            timestamp=timestamp,
            features=feature_set.values,
            uncertainty=uncertainty,
            missing_features=missing,
            warnings=warnings,
            requires_investigation=requires_investigation,
        )

    def health(self) -> dict[str, Any]:
        """Return anomaly engine health."""

        return {
            "model": self.model.health(),
            "feature_count": len(
                self.feature_engineer.feature_names
            ),
            "investigation_threshold": (
                self.investigation_threshold
            ),
            "interpretation": (
                "Anomaly detection is a screening signal, "
                "not proof of a disaster."
            ),
        }