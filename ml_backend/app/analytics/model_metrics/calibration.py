"""
Probability calibration and uncertainty quantification for hazard risk models.

Calculates Expected Calibration Error (ECE), Maximum Calibration Error (MCE),
Brier score decomposition, and reliability diagram bins for safety-critical ML predictions.
"""

from __future__ import annotations

import math
import statistics
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Tuple


@dataclass
class ReliabilityBin:
    """A confidence interval bin in a reliability diagram."""

    bin_index: int
    confidence_lower: float
    confidence_upper: float
    sample_count: int
    mean_confidence: float
    accuracy: float
    calibration_gap: float  # abs(accuracy - mean_confidence)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "bin_index": self.bin_index,
            "confidence_lower": round(self.confidence_lower, 3),
            "confidence_upper": round(self.confidence_upper, 3),
            "sample_count": self.sample_count,
            "mean_confidence": round(self.mean_confidence, 4),
            "accuracy": round(self.accuracy, 4),
            "calibration_gap": round(self.calibration_gap, 4),
        }


@dataclass
class CalibrationMetrics:
    """Comprehensive probability calibration metrics."""

    expected_calibration_error: float  # ECE
    maximum_calibration_error: float   # MCE
    brier_score: float
    is_well_calibrated: bool  # ECE < 0.05
    reliability_bins: List[ReliabilityBin] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "expected_calibration_error": round(self.expected_calibration_error, 4),
            "maximum_calibration_error": round(self.maximum_calibration_error, 4),
            "brier_score": round(self.brier_score, 4),
            "is_well_calibrated": self.is_well_calibrated,
            "reliability_bins": [b.to_dict() for b in self.reliability_bins],
        }


class ModelCalibrationEvaluator:
    """
    Evaluates how accurately predicted probabilities represent true real-world hazard frequencies.
    """

    @classmethod
    def evaluate_binary_calibration(
        cls,
        y_true: Sequence[int],
        y_prob: Sequence[float],
        n_bins: int = 10,
    ) -> CalibrationMetrics:
        """
        Partition probabilities into equal-width bins and compute ECE, MCE, and Brier Score.
        """
        if len(y_true) != len(y_prob):
            raise ValueError("y_true and y_prob must have equal length")

        n = len(y_true)
        if n == 0:
            return CalibrationMetrics(0.0, 0.0, 0.0, True, [])

        # Calculate Brier score: mean squared difference between prob and outcome
        brier = sum((p - t) ** 2 for t, p in zip(y_true, y_prob)) / n

        bin_width = 1.0 / n_bins
        bins: List[ReliabilityBin] = []
        ece = 0.0
        mce = 0.0

        for b in range(n_bins):
            lower = b * bin_width
            upper = (b + 1) * bin_width

            # Select samples in this bin
            bin_indices = [
                i for i, p in enumerate(y_prob)
                if (lower <= p < upper) or (b == n_bins - 1 and lower <= p <= upper)
            ]

            bin_count = len(bin_indices)
            if bin_count == 0:
                bins.append(
                    ReliabilityBin(
                        bin_index=b,
                        confidence_lower=lower,
                        confidence_upper=upper,
                        sample_count=0,
                        mean_confidence=(lower + upper) / 2.0,
                        accuracy=0.0,
                        calibration_gap=0.0,
                    )
                )
                continue

            bin_probs = [y_prob[i] for i in bin_indices]
            bin_trues = [y_true[i] for i in bin_indices]

            mean_conf = statistics.mean(bin_probs)
            acc = sum(bin_trues) / bin_count
            gap = abs(acc - mean_conf)

            weight = bin_count / n
            ece += weight * gap
            if gap > mce:
                mce = gap

            bins.append(
                ReliabilityBin(
                    bin_index=b,
                    confidence_lower=lower,
                    confidence_upper=upper,
                    sample_count=bin_count,
                    mean_confidence=mean_conf,
                    accuracy=acc,
                    calibration_gap=gap,
                )
            )

        is_calibrated = ece < 0.05

        return CalibrationMetrics(
            expected_calibration_error=ece,
            maximum_calibration_error=mce,
            brier_score=brier,
            is_well_calibrated=is_calibrated,
            reliability_bins=bins,
        )
