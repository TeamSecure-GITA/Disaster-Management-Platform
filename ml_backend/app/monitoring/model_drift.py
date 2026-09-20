"""
Model drift monitoring.

Detects changes in model prediction behavior after deployment.

Supported measurements:
- Population Stability Index (PSI)
- Prediction distribution shift
- Confidence shift
- Mean prediction shift

Important:
Drift does not automatically mean that a model is inaccurate.
It is a signal that the model should be investigated/revalidated.
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Deque, Dict, List, Optional


@dataclass
class DriftResult:
    """Result of a model drift calculation."""

    model_name: str
    drift_detected: bool
    score: float
    severity: str
    metric: str
    timestamp: str
    details: Dict


class ModelDriftMonitor:
    """
    Monitor prediction distributions for deployed models.

    Example:

        monitor = ModelDriftMonitor()

        monitor.register_baseline(
            "landslide",
            [0.1, 0.2, 0.3, 0.2, 0.4]
        )

        monitor.record_predictions(
            "landslide",
            [0.7, 0.8, 0.9]
        )

        result = monitor.calculate_drift("landslide")
    """

    def __init__(
        self,
        max_samples: int = 10_000,
        psi_warning: float = 0.10,
        psi_critical: float = 0.25,
    ):
        self.max_samples = max_samples

        self.psi_warning = psi_warning
        self.psi_critical = psi_critical

        self.baselines: Dict[
            str,
            List[float]
        ] = {}

        self.predictions: Dict[
            str,
            Deque[float]
        ] = defaultdict(
            lambda: deque(
                maxlen=self.max_samples
            )
        )

        self.confidences: Dict[
            str,
            Deque[float]
        ] = defaultdict(
            lambda: deque(
                maxlen=self.max_samples
            )
        )

    # ---------------------------------------------------------
    # Baseline
    # ---------------------------------------------------------

    def register_baseline(
        self,
        model_name: str,
        predictions: List[float],
    ) -> None:
        """
        Register reference predictions.

        Usually generated from the validation/test dataset.
        """

        values = self._clean_values(predictions)

        if not values:
            raise ValueError(
                "Baseline predictions cannot be empty."
            )

        self.baselines[model_name] = values

    # ---------------------------------------------------------
    # Runtime data
    # ---------------------------------------------------------

    def record_prediction(
        self,
        model_name: str,
        prediction: float,
        confidence: Optional[float] = None,
    ) -> None:
        """Record one prediction."""

        if not math.isfinite(prediction):
            return

        self.predictions[model_name].append(
            float(prediction)
        )

        if confidence is not None:
            if math.isfinite(confidence):
                self.confidences[model_name].append(
                    float(confidence)
                )

    def record_predictions(
        self,
        model_name: str,
        predictions: List[float],
    ) -> None:
        """Record multiple predictions."""

        for prediction in predictions:
            self.record_prediction(
                model_name=model_name,
                prediction=prediction,
            )

    # ---------------------------------------------------------
    # PSI
    # ---------------------------------------------------------

    @staticmethod
    def _clean_values(
        values: List[float],
    ) -> List[float]:

        return [
            float(value)
            for value in values
            if value is not None
            and math.isfinite(float(value))
        ]

    @staticmethod
    def _histogram(
        values: List[float],
        bins: int = 10,
    ) -> List[float]:

        if not values:
            return []

        minimum = min(values)
        maximum = max(values)

        if minimum == maximum:
            return [1.0]

        width = (
            maximum - minimum
        ) / bins

        counts = [0] * bins

        for value in values:
            index = int(
                (value - minimum) / width
            )

            if index >= bins:
                index = bins - 1

            if index < 0:
                index = 0

            counts[index] += 1

        total = len(values)

        return [
            count / total
            for count in counts
        ]

    @staticmethod
    def _psi(
        expected: List[float],
        actual: List[float],
    ) -> float:

        if not expected or not actual:
            return 0.0

        size = min(
            len(expected),
            len(actual),
        )

        epsilon = 1e-6

        score = 0.0

        for index in range(size):

            expected_value = max(
                expected[index],
                epsilon,
            )

            actual_value = max(
                actual[index],
                epsilon,
            )

            score += (
                actual_value
                - expected_value
            ) * math.log(
                actual_value
                / expected_value
            )

        return float(score)

    # ---------------------------------------------------------
    # Drift calculation
    # ---------------------------------------------------------

    def calculate_drift(
        self,
        model_name: str,
        bins: int = 10,
    ) -> DriftResult:

        baseline = self.baselines.get(
            model_name
        )

        current = list(
            self.predictions.get(
                model_name,
                []
            )
        )

        timestamp = datetime.now(
            timezone.utc
        ).isoformat()

        if not baseline:
            return DriftResult(
                model_name=model_name,
                drift_detected=False,
                score=0.0,
                severity="unknown",
                metric="psi",
                timestamp=timestamp,
                details={
                    "message": (
                        "No baseline registered."
                    )
                },
            )

        if not current:
            return DriftResult(
                model_name=model_name,
                drift_detected=False,
                score=0.0,
                severity="unknown",
                metric="psi",
                timestamp=timestamp,
                details={
                    "message": (
                        "No runtime predictions "
                        "available."
                    )
                },
            )

        expected_histogram = self._histogram(
            baseline,
            bins=bins,
        )

        actual_histogram = self._histogram(
            current,
            bins=bins,
        )

        # Histograms can have different lengths
        # when baseline/current values are constant.
        length = min(
            len(expected_histogram),
            len(actual_histogram),
        )

        score = self._psi(
            expected_histogram[:length],
            actual_histogram[:length],
        )

        if score >= self.psi_critical:
            severity = "critical"
            detected = True

        elif score >= self.psi_warning:
            severity = "warning"
            detected = True

        else:
            severity = "normal"
            detected = False

        return DriftResult(
            model_name=model_name,
            drift_detected=detected,
            score=round(score, 6),
            severity=severity,
            metric="psi",
            timestamp=timestamp,
            details={
                "baseline_samples": len(baseline),
                "runtime_samples": len(current),
                "baseline_mean": statistics.mean(
                    baseline
                ),
                "runtime_mean": statistics.mean(
                    current
                ),
                "psi_warning_threshold": (
                    self.psi_warning
                ),
                "psi_critical_threshold": (
                    self.psi_critical
                ),
            },
        )

    # ---------------------------------------------------------
    # Confidence drift
    # ---------------------------------------------------------

    def confidence_statistics(
        self,
        model_name: str,
    ) -> Dict:

        values = list(
            self.confidences.get(
                model_name,
                []
            )
        )

        if not values:
            return {
                "available": False,
                "count": 0,
            }

        return {
            "available": True,
            "count": len(values),
            "mean": statistics.mean(values),
            "minimum": min(values),
            "maximum": max(values),
            "median": statistics.median(values),
        }

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    def health(self) -> Dict:

        return {
            "status": "healthy",
            "models_registered": len(
                self.baselines
            ),
            "models_with_predictions": len(
                self.predictions
            ),
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }