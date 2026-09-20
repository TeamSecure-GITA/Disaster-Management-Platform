"""
Confidence management for AI and ML results.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional


class ConfidenceLevel(str, Enum):
    """Human-readable confidence levels."""

    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


@dataclass
class ConfidenceResult:
    """Normalized confidence result."""

    score: float
    level: ConfidenceLevel
    explanation: str
    requires_review: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "level": self.level.value,
            "explanation": self.explanation,
            "requires_review": self.requires_review,
        }


class ConfidenceManager:
    """
    Converts numeric confidence into a standardized representation.

    Confidence is not equivalent to correctness. It represents the confidence
    supplied by the underlying model/system.
    """

    def __init__(
        self,
        review_threshold: float = 0.60,
    ):
        self.review_threshold = review_threshold

    def evaluate(
        self,
        score: Optional[float],
        *,
        source: str = "unknown",
        calibrated: bool = False,
    ) -> ConfidenceResult:
        """Evaluate a confidence score."""

        if score is None:
            return ConfidenceResult(
                score=0.0,
                level=ConfidenceLevel.VERY_LOW,
                explanation=(
                    "No confidence score was supplied by the underlying "
                    "system."
                ),
                requires_review=True,
            )

        score = float(score)

        if score < 0.0 or score > 1.0:
            raise ValueError(
                "Confidence score must be between 0 and 1."
            )

        if score < 0.20:
            level = ConfidenceLevel.VERY_LOW
        elif score < 0.40:
            level = ConfidenceLevel.LOW
        elif score < 0.60:
            level = ConfidenceLevel.MODERATE
        elif score < 0.85:
            level = ConfidenceLevel.HIGH
        else:
            level = ConfidenceLevel.VERY_HIGH

        explanation = (
            f"Confidence supplied by {source}: {score:.2f}."
        )

        if calibrated:
            explanation += " The score is marked as calibrated."
        else:
            explanation += (
                " Calibration status is unknown; confidence should not "
                "be interpreted as a probability of correctness."
            )

        return ConfidenceResult(
            score=round(score, 4),
            level=level,
            explanation=explanation,
            requires_review=score < self.review_threshold,
        )

    def combine(
        self,
        scores: list[float],
        *,
        method: str = "mean",
    ) -> ConfidenceResult:
        """Combine multiple confidence scores."""

        if not scores:
            return self.evaluate(None, source="combined")

        cleaned = [
            max(0.0, min(1.0, float(score)))
            for score in scores
        ]

        if method == "minimum":
            combined = min(cleaned)

        elif method == "geometric":
            product = 1.0

            for score in cleaned:
                product *= score

            combined = product ** (1.0 / len(cleaned))

        else:
            combined = sum(cleaned) / len(cleaned)

        return self.evaluate(
            combined,
            source=f"combined/{method}",
        )