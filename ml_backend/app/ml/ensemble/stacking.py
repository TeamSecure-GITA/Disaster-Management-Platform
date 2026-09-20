"""
Stacking ensemble.

A meta-model learns how to combine outputs from base models.

This module is provider-agnostic and expects a meta-estimator exposing
predict() and optionally predict_proba().
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional, Sequence


@dataclass
class StackingPrediction:
    """Result returned by a stacking ensemble."""

    status: str

    score: Optional[float]

    risk_level: Optional[str]

    base_models: list[str]

    base_scores: dict[str, float]

    confidence: Optional[float]

    timestamp: str

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class StackingEnsemble:
    """
    Meta-model ensemble.

    Example:

        base_scores = {
            "landslide": 0.72,
            "rainfall": 0.81,
            "soil": 0.66,
        }

        result = ensemble.predict(base_scores)

    The meta-model must already be trained if operational predictions
    are required.
    """

    def __init__(
        self,
        meta_model: Any = None,
        feature_order: Optional[
            Sequence[str]
        ] = None,
        low_threshold: float = 0.30,
        moderate_threshold: float = 0.50,
        high_threshold: float = 0.70,
    ) -> None:
        self.meta_model = meta_model

        self.feature_order = tuple(
            feature_order or ()
        )

        self.low_threshold = (
            low_threshold
        )
        self.moderate_threshold = (
            moderate_threshold
        )
        self.high_threshold = (
            high_threshold
        )

        if not (
            0.0
            <= self.low_threshold
            < self.moderate_threshold
            < self.high_threshold
            <= 1.0
        ):
            raise ValueError(
                "Invalid stacking thresholds."
            )

    @property
    def is_loaded(self) -> bool:
        return self.meta_model is not None

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

    @staticmethod
    def _validate_scores(
        scores: Mapping[str, float],
    ) -> None:
        for name, score in scores.items():
            value = float(score)

            if not 0.0 <= value <= 1.0:
                raise ValueError(
                    f"Base model score for {name} "
                    f"must be between 0 and 1."
                )

    def predict(
        self,
        base_scores: Mapping[str, float],
    ) -> StackingPrediction:
        """Generate a meta-model prediction."""

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        if not base_scores:
            return StackingPrediction(
                status="no_predictions",
                score=None,
                risk_level=None,
                base_models=[],
                base_scores={},
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    "No base model scores were supplied."
                ],
            )

        try:
            self._validate_scores(
                base_scores
            )
        except ValueError as exc:
            return StackingPrediction(
                status="invalid_scores",
                score=None,
                risk_level=None,
                base_models=list(
                    base_scores.keys()
                ),
                base_scores=dict(
                    base_scores
                ),
                confidence=None,
                timestamp=timestamp,
                warnings=[str(exc)],
            )

        if not self.is_loaded:
            return StackingPrediction(
                status="meta_model_not_loaded",
                score=None,
                risk_level=None,
                base_models=list(
                    base_scores.keys()
                ),
                base_scores=dict(
                    base_scores
                ),
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    (
                        "Meta-model is not loaded; "
                        "no stacked prediction was generated."
                    )
                ],
            )

        feature_order = (
            self.feature_order
            or tuple(base_scores.keys())
        )

        missing = [
            name
            for name in feature_order
            if name not in base_scores
        ]

        if missing:
            return StackingPrediction(
                status="insufficient_data",
                score=None,
                risk_level=None,
                base_models=list(
                    base_scores.keys()
                ),
                base_scores=dict(
                    base_scores
                ),
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    (
                        "Missing base-model outputs: "
                        + ", ".join(missing)
                    )
                ],
            )

        vector = [
            float(base_scores[name])
            for name in feature_order
        ]

        warnings: list[str] = []

        try:
            raw_prediction = (
                self.meta_model.predict(
                    [vector]
                )
            )

            score = float(
                raw_prediction[0]
            )

        except Exception as exc:
            return StackingPrediction(
                status="prediction_failed",
                score=None,
                risk_level=None,
                base_models=list(
                    base_scores.keys()
                ),
                base_scores=dict(
                    base_scores
                ),
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    f"Meta-model prediction failed: {exc}"
                ],
            )

        if not 0.0 <= score <= 1.0:
            warnings.append(
                (
                    "Meta-model output is outside [0, 1]. "
                    "It is not treated as a probability."
                )
            )

            return StackingPrediction(
                status="invalid_output",
                score=score,
                risk_level=None,
                base_models=list(
                    base_scores.keys()
                ),
                base_scores=dict(
                    base_scores
                ),
                confidence=None,
                timestamp=timestamp,
                warnings=warnings,
            )

        confidence: Optional[float] = None

        if hasattr(
            self.meta_model,
            "predict_proba",
        ):
            try:
                probabilities = (
                    self.meta_model.predict_proba(
                        [vector]
                    )[0]
                )

                confidence = float(
                    max(probabilities)
                )
            except Exception:
                warnings.append(
                    "Meta-model confidence unavailable."
                )

        warnings.append(
            (
                "Stacked score depends on the training and "
                "calibration of the meta-model."
            )
        )

        return StackingPrediction(
            status="success",
            score=round(
                score,
                6,
            ),
            risk_level=self._risk_level(
                score
            ),
            base_models=list(
                base_scores.keys()
            ),
            base_scores=dict(
                base_scores
            ),
            confidence=(
                round(
                    confidence,
                    6,
                )
                if confidence is not None
                else None
            ),
            timestamp=timestamp,
            warnings=warnings,
        )