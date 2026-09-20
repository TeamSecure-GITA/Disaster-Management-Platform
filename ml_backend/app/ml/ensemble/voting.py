"""
Weighted voting ensemble.

Combines predictions from multiple hazard models.

Important:
An ensemble score is only as meaningful as the component model outputs
and their calibration. It must not be interpreted as ground truth.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional


@dataclass
class ModelVote:
    """Prediction supplied by one component model."""

    model_name: str
    score: float

    weight: float = 1.0

    risk_level: Optional[str] = None

    confidence: Optional[float] = None

    metadata: dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class VotingPrediction:
    """Combined voting result."""

    status: str

    score: Optional[float]

    risk_level: Optional[str]

    model_count: int

    total_weight: float

    votes: list[ModelVote]

    disagreement: Optional[float]

    confidence: Optional[float]

    timestamp: str

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class VotingEnsemble:
    """
    Weighted voting ensemble for normalized hazard scores.

    Scores are expected to be in [0, 1].

    Risk levels:
        < 0.30  -> low
        < 0.50  -> moderate
        < 0.70  -> high
        >= 0.70 -> very_high
    """

    def __init__(
        self,
        weights: Optional[
            Mapping[str, float]
        ] = None,
        low_threshold: float = 0.30,
        moderate_threshold: float = 0.50,
        high_threshold: float = 0.70,
    ) -> None:
        self.weights = dict(
            weights or {}
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

        self._validate_thresholds()

    def _validate_thresholds(self) -> None:
        thresholds = (
            self.low_threshold,
            self.moderate_threshold,
            self.high_threshold,
        )

        if not all(
            0.0 <= value <= 1.0
            for value in thresholds
        ):
            raise ValueError(
                "Ensemble thresholds must be between 0 and 1."
            )

        if not (
            self.low_threshold
            < self.moderate_threshold
            < self.high_threshold
        ):
            raise ValueError(
                "Ensemble thresholds must be strictly increasing."
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

    @staticmethod
    def _validate_score(
        score: float,
    ) -> float:
        value = float(score)

        if not 0.0 <= value <= 1.0:
            raise ValueError(
                f"Model score must be between 0 and 1: {value}"
            )

        return value

    def _calculate_disagreement(
        self,
        scores: list[float],
    ) -> Optional[float]:
        if len(scores) < 2:
            return None

        mean = sum(scores) / len(scores)

        variance = sum(
            (score - mean) ** 2
            for score in scores
        ) / len(scores)

        return round(
            variance ** 0.5,
            6,
        )

    def combine(
        self,
        predictions: Mapping[
            str,
            float | ModelVote,
        ],
    ) -> VotingPrediction:
        """
        Combine model scores.

        `predictions` may contain either:
            {"flood": 0.7, "landslide": 0.4}

        or:
            {"flood": ModelVote(...)}
        """

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        warnings: list[str] = []

        if not predictions:
            return VotingPrediction(
                status="no_predictions",
                score=None,
                risk_level=None,
                model_count=0,
                total_weight=0.0,
                votes=[],
                disagreement=None,
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    "No model predictions were supplied."
                ],
            )

        votes: list[ModelVote] = []

        for model_name, prediction in (
            predictions.items()
        ):
            if isinstance(
                prediction,
                ModelVote,
            ):
                vote = prediction

                if vote.model_name != model_name:
                    vote = ModelVote(
                        model_name=model_name,
                        score=vote.score,
                        weight=vote.weight,
                        risk_level=vote.risk_level,
                        confidence=vote.confidence,
                        metadata=vote.metadata,
                    )
            else:
                vote = ModelVote(
                    model_name=model_name,
                    score=float(prediction),
                    weight=self.weights.get(
                        model_name,
                        1.0,
                    ),
                )

            vote.score = (
                self._validate_score(
                    vote.score
                )
            )

            if vote.weight < 0:
                raise ValueError(
                    f"Negative ensemble weight for "
                    f"{model_name}."
                )

            votes.append(vote)

        active_votes = [
            vote
            for vote in votes
            if vote.weight > 0
        ]

        if not active_votes:
            return VotingPrediction(
                status="invalid_weights",
                score=None,
                risk_level=None,
                model_count=len(votes),
                total_weight=0.0,
                votes=votes,
                disagreement=None,
                confidence=None,
                timestamp=timestamp,
                warnings=[
                    "All ensemble weights are zero."
                ],
            )

        total_weight = sum(
            vote.weight
            for vote in active_votes
        )

        combined_score = (
            sum(
                vote.score * vote.weight
                for vote in active_votes
            )
            / total_weight
        )

        scores = [
            vote.score
            for vote in active_votes
        ]

        disagreement = (
            self._calculate_disagreement(
                scores
            )
        )

        confidence_values = [
            vote.confidence
            for vote in active_votes
            if vote.confidence is not None
        ]

        confidence = None

        if confidence_values:
            confidence = (
                sum(confidence_values)
                / len(confidence_values)
            )

        if (
            disagreement is not None
            and disagreement > 0.20
        ):
            warnings.append(
                (
                    "Component models show substantial disagreement. "
                    "Review individual model outputs."
                )
            )

        if not confidence_values:
            warnings.append(
                (
                    "No component confidence values were supplied; "
                    "ensemble confidence is unavailable."
                )
            )

        return VotingPrediction(
            status="success",
            score=round(
                combined_score,
                6,
            ),
            risk_level=self._risk_level(
                combined_score
            ),
            model_count=len(
                active_votes
            ),
            total_weight=round(
                total_weight,
                6,
            ),
            votes=votes,
            disagreement=disagreement,
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