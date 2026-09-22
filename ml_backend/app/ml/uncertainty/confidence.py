"""
Confidence estimation utilities.

Confidence here is explicitly treated as an uncertainty/data-quality
indicator unless a statistically validated confidence interpretation
has been established by the model.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Optional, Sequence


@dataclass
class ConfidenceResult:
    """Structured confidence result."""

    status: str

    confidence: Optional[float]

    confidence_type: str

    components: dict[str, float]

    warnings: list[str] = field(
        default_factory=list
    )

    timestamp: str = ""

    @property
    def score(self) -> Optional[float]:
        return self.confidence

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class ConfidenceEstimator:
    """
    Estimate an operational confidence indicator.

    Components can include:
    - input completeness
    - model probability concentration
    - sensor quality
    - data freshness
    - model agreement

    This is NOT automatically a statistical confidence interval.
    """

    def __init__(
        self,
        weights: Optional[
            Mapping[str, float]
        ] = None,
    ) -> None:
        self.weights = dict(
            weights
            or {
                "input_completeness": 0.35,
                "sensor_quality": 0.25,
                "model_agreement": 0.25,
                "data_freshness": 0.15,
            }
        )

        total = sum(
            self.weights.values()
        )

        if total <= 0:
            raise ValueError(
                "Confidence weights must have a positive total."
            )

    @staticmethod
    def _validate_component(
        value: float,
    ) -> float:
        value = float(value)

        if not 0.0 <= value <= 1.0:
            raise ValueError(
                f"Confidence component must be between "
                f"0 and 1: {value}"
            )

        return value

    def calculate(
        self,
        components: Optional[Mapping[str, float]] = None,
        **kwargs: float,
    ) -> ConfidenceResult:
        """Calculate weighted confidence."""
        if components is None:
            components = {}
        if kwargs:
            components = {**components, **kwargs}

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        if not components:
            return ConfidenceResult(
                status="no_components",
                confidence=None,
                confidence_type=(
                    "operational_data_quality_indicator"
                ),
                components={},
                warnings=[
                    "No confidence components supplied."
                ],
                timestamp=timestamp,
            )

        validated: dict[
            str,
            float,
        ] = {}

        warnings: list[str] = []

        for name, value in components.items():
            try:
                validated[name] = (
                    self._validate_component(
                        value
                    )
                )
            except ValueError as exc:
                return ConfidenceResult(
                    status="invalid_component",
                    confidence=None,
                    confidence_type=(
                        "operational_data_quality_indicator"
                    ),
                    components={},
                    warnings=[
                        f"{name}: {exc}"
                    ],
                    timestamp=timestamp,
                )

        active_weights = {
            name: weight
            for name, weight in self.weights.items()
            if name in validated
        }

        if not active_weights:
            active_weights = {name: 1.0 for name in validated}

        weight_total = sum(
            active_weights.values()
        )

        confidence = (
            sum(
                validated[name]
                * active_weights[name]
                for name in active_weights
            )
            / weight_total
        )

        missing_components = [
            name
            for name in self.weights
            if name not in validated
        ]

        if missing_components:
            warnings.append(
                (
                    "Some configured confidence components "
                    "were unavailable: "
                    + ", ".join(
                        missing_components
                    )
                )
            )

        warnings.append(
            (
                "This value is an operational confidence "
                "indicator, not a guarantee or automatically "
                "a statistically valid confidence probability."
            )
        )

        return ConfidenceResult(
            status="success",
            confidence=round(
                confidence,
                6,
            ),
            confidence_type=(
                "operational_data_quality_indicator"
            ),
            components=validated,
            warnings=warnings,
            timestamp=timestamp,
        )

    def from_probability(
        self,
        probabilities: Sequence[float],
    ) -> ConfidenceResult:
        """
        Estimate model-output concentration.

        For a classification model, a concentrated probability
        distribution can be used as one confidence component.
        """

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        if not probabilities:
            return ConfidenceResult(
                status="no_probabilities",
                confidence=None,
                confidence_type=(
                    "probability_concentration"
                ),
                components={},
                warnings=[
                    "No probabilities supplied."
                ],
                timestamp=timestamp,
            )

        values = [
            float(value)
            for value in probabilities
        ]

        if any(
            value < 0 or value > 1
            for value in values
        ):
            return ConfidenceResult(
                status="invalid_probabilities",
                confidence=None,
                confidence_type=(
                    "probability_concentration"
                ),
                components={},
                warnings=[
                    "Probabilities must be in [0, 1]."
                ],
                timestamp=timestamp,
            )

        total = sum(values)

        if total <= 0:
            return ConfidenceResult(
                status="invalid_probabilities",
                confidence=None,
                confidence_type=(
                    "probability_concentration"
                ),
                components={},
                warnings=[
                    "Probability total must be positive."
                ],
                timestamp=timestamp,
            )

        normalized = [
            value / total
            for value in values
        ]

        maximum = max(
            normalized
        )

        return ConfidenceResult(
            status="success",
            confidence=round(
                maximum,
                6,
            ),
            confidence_type=(
                "probability_concentration"
            ),
            components={
                "maximum_class_probability": maximum
            },
            warnings=[
                (
                    "Maximum class probability should only be "
                    "treated as confidence when model probabilities "
                    "have been appropriately validated/calibrated."
                )
            ],
            timestamp=timestamp,
        )