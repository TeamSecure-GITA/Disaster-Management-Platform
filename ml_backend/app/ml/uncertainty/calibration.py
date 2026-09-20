"""
Uncertainty calibration.

This module evaluates whether supplied confidence/probability values
match observed outcomes.

The implementation intentionally uses simple, transparent metrics.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Sequence


@dataclass
class UncertaintyCalibrationResult:
    """Calibration evaluation result."""

    status: str

    sample_count: int

    brier_score: float | None

    expected_calibration_error: float | None

    mean_confidence: float | None

    empirical_accuracy: float | None

    calibrated: bool

    warnings: list[str] = field(
        default_factory=list
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class UncertaintyCalibrator:
    """
    Evaluate probabilistic classification calibration.

    Inputs:
        probabilities:
            predicted probability of the positive class.

        outcomes:
            observed binary outcomes, 0 or 1.

    This evaluator does not modify the model.
    """

    def __init__(
        self,
        bins: int = 10,
        acceptable_ece: float = 0.05,
    ) -> None:
        if bins < 2:
            raise ValueError(
                "At least two calibration bins are required."
            )

        if not 0.0 <= acceptable_ece <= 1.0:
            raise ValueError(
                "acceptable_ece must be between 0 and 1."
            )

        self.bins = bins
        self.acceptable_ece = (
            acceptable_ece
        )

    @staticmethod
    def _validate_inputs(
        probabilities: Sequence[float],
        outcomes: Sequence[int],
    ) -> None:
        if not probabilities:
            raise ValueError(
                "No probabilities supplied."
            )

        if len(probabilities) != len(
            outcomes
        ):
            raise ValueError(
                "Probabilities and outcomes must have equal lengths."
            )

        for probability in probabilities:
            if not 0.0 <= float(
                probability
            ) <= 1.0:
                raise ValueError(
                    "Probabilities must be in [0, 1]."
                )

        for outcome in outcomes:
            if int(outcome) not in (
                0,
                1,
            ):
                raise ValueError(
                    "Outcomes must be binary 0/1."
                )

    def evaluate(
        self,
        probabilities: Sequence[float],
        outcomes: Sequence[int],
    ) -> UncertaintyCalibrationResult:
        """Evaluate calibration."""

        try:
            self._validate_inputs(
                probabilities,
                outcomes,
            )
        except ValueError as exc:
            return UncertaintyCalibrationResult(
                status="invalid_inputs",
                sample_count=0,
                brier_score=None,
                expected_calibration_error=None,
                mean_confidence=None,
                empirical_accuracy=None,
                calibrated=False,
                warnings=[str(exc)],
            )

        probabilities = [
            float(value)
            for value in probabilities
        ]

        outcomes = [
            int(value)
            for value in outcomes
        ]

        n = len(
            probabilities
        )

        brier_score = sum(
            (
                probability - outcome
            )
            ** 2
            for probability, outcome in zip(
                probabilities,
                outcomes,
            )
        ) / n

        mean_confidence = (
            sum(probabilities)
            / n
        )

        empirical_accuracy = (
            sum(outcomes)
            / n
        )

        ece = self._expected_calibration_error(
            probabilities,
            outcomes,
        )

        calibrated = (
            ece
            <= self.acceptable_ece
        )

        warnings = [
            (
                "Calibration quality depends on the evaluation "
                "dataset being representative of deployment data."
            )
        ]

        if not calibrated:
            warnings.append(
                (
                    "The measured calibration error exceeds "
                    "the configured acceptable threshold."
                )
            )

        return UncertaintyCalibrationResult(
            status="success",
            sample_count=n,
            brier_score=round(
                brier_score,
                6,
            ),
            expected_calibration_error=round(
                ece,
                6,
            ),
            mean_confidence=round(
                mean_confidence,
                6,
            ),
            empirical_accuracy=round(
                empirical_accuracy,
                6,
            ),
            calibrated=calibrated,
            warnings=warnings,
        )

    def _expected_calibration_error(
        self,
        probabilities: Sequence[float],
        outcomes: Sequence[int],
    ) -> float:
        """Calculate expected calibration error."""

        total_error = 0.0

        for bin_index in range(
            self.bins
        ):
            lower = (
                bin_index
                / self.bins
            )

            upper = (
                (bin_index + 1)
                / self.bins
            )

            indices = [
                index
                for index, probability
                in enumerate(
                    probabilities
                )
                if (
                    probability >= lower
                    and (
                        probability < upper
                        or (
                            bin_index
                            == self.bins - 1
                            and probability
                            <= upper
                        )
                    )
                )
            ]

            if not indices:
                continue

            bin_confidence = (
                sum(
                    probabilities[index]
                    for index in indices
                )
                / len(indices)
            )

            bin_accuracy = (
                sum(
                    outcomes[index]
                    for index in indices
                )
                / len(indices)
            )

            weight = (
                len(indices)
                / len(probabilities)
            )

            total_error += (
                weight
                * abs(
                    bin_confidence
                    - bin_accuracy
                )
            )

        return total_error