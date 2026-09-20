"""
Data drift monitoring.

Monitors changes in feature distributions between:
- Reference/training data
- Current incoming data

This helps detect:
- Sensor changes
- Seasonal changes
- Distribution shifts
- Invalid data pipelines
- Unexpected environmental conditions
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Deque, Dict, List, Optional


@dataclass
class FeatureDriftResult:
    feature: str
    drift_detected: bool
    score: float
    severity: str
    metric: str
    details: Dict


class DataDriftMonitor:
    """
    Monitor feature-level distribution drift.

    Example:

        monitor.register_reference(
            "rainfall_24h",
            [12, 14, 15, 18, 20]
        )

        monitor.record(
            "rainfall_24h",
            35
        )
    """

    def __init__(
        self,
        max_samples: int = 10_000,
        warning_threshold: float = 0.10,
        critical_threshold: float = 0.25,
    ):
        self.max_samples = max_samples

        self.warning_threshold = (
            warning_threshold
        )

        self.critical_threshold = (
            critical_threshold
        )

        self.reference: Dict[
            str,
            List[float]
        ] = {}

        self.current: Dict[
            str,
            Deque[float]
        ] = defaultdict(
            lambda: deque(
                maxlen=self.max_samples
            )
        )

    # ---------------------------------------------------------
    # Reference
    # ---------------------------------------------------------

    def register_reference(
        self,
        feature: str,
        values: List[float],
    ) -> None:

        cleaned = self._clean(values)

        if not cleaned:
            raise ValueError(
                f"Reference data for "
                f"'{feature}' is empty."
            )

        self.reference[feature] = cleaned

    # ---------------------------------------------------------
    # Runtime values
    # ---------------------------------------------------------

    def record(
        self,
        feature: str,
        value: float,
    ) -> None:

        try:
            value = float(value)
        except (
            TypeError,
            ValueError,
        ):
            return

        if not math.isfinite(value):
            return

        self.current[feature].append(value)

    def record_batch(
        self,
        feature: str,
        values: List[float],
    ) -> None:

        for value in values:
            self.record(
                feature,
                value,
            )

    # ---------------------------------------------------------
    # Utilities
    # ---------------------------------------------------------

    @staticmethod
    def _clean(
        values: List[float],
    ) -> List[float]:

        result = []

        for value in values:

            try:
                value = float(value)
            except (
                TypeError,
                ValueError,
            ):
                continue

            if math.isfinite(value):
                result.append(value)

        return result

    @staticmethod
    def _mean_shift(
        reference: List[float],
        current: List[float],
    ) -> float:

        if not reference or not current:
            return 0.0

        reference_mean = statistics.mean(
            reference
        )

        current_mean = statistics.mean(
            current
        )

        reference_std = (
            statistics.stdev(reference)
            if len(reference) > 1
            else 1.0
        )

        reference_std = max(
            reference_std,
            1e-6,
        )

        return abs(
            current_mean
            - reference_mean
        ) / reference_std

    # ---------------------------------------------------------
    # PSI
    # ---------------------------------------------------------

    @staticmethod
    def _histogram(
        values: List[float],
        minimum: float,
        maximum: float,
        bins: int = 10,
    ) -> List[float]:

        if maximum <= minimum:
            return [1.0]

        width = (
            maximum - minimum
        ) / bins

        counts = [0] * bins

        for value in values:

            index = int(
                (value - minimum)
                / width
            )

            index = max(
                0,
                min(
                    index,
                    bins - 1,
                ),
            )

            counts[index] += 1

        total = len(values)

        return [
            count / total
            for count in counts
        ]

    @staticmethod
    def _psi(
        reference: List[float],
        current: List[float],
    ) -> float:

        epsilon = 1e-6

        score = 0.0

        for ref, cur in zip(
            reference,
            current,
        ):

            ref = max(
                ref,
                epsilon,
            )

            cur = max(
                cur,
                epsilon,
            )

            score += (
                cur - ref
            ) * math.log(
                cur / ref
            )

        return float(score)

    # ---------------------------------------------------------
    # Feature analysis
    # ---------------------------------------------------------

    def analyze(
        self,
        feature: str,
        bins: int = 10,
    ) -> FeatureDriftResult:

        reference = self.reference.get(
            feature,
            []
        )

        current = list(
            self.current.get(
                feature,
                []
            )
        )

        if not reference:
            return FeatureDriftResult(
                feature=feature,
                drift_detected=False,
                score=0.0,
                severity="unknown",
                metric="psi",
                details={
                    "message": (
                        "No reference data."
                    )
                },
            )

        if not current:
            return FeatureDriftResult(
                feature=feature,
                drift_detected=False,
                score=0.0,
                severity="unknown",
                metric="psi",
                details={
                    "message": (
                        "No current data."
                    )
                },
            )

        minimum = min(
            min(reference),
            min(current),
        )

        maximum = max(
            max(reference),
            max(current),
        )

        expected = self._histogram(
            reference,
            minimum,
            maximum,
            bins,
        )

        actual = self._histogram(
            current,
            minimum,
            maximum,
            bins,
        )

        score = self._psi(
            expected,
            actual,
        )

        if score >= self.critical_threshold:
            severity = "critical"
            detected = True

        elif score >= self.warning_threshold:
            severity = "warning"
            detected = True

        else:
            severity = "normal"
            detected = False

        return FeatureDriftResult(
            feature=feature,
            drift_detected=detected,
            score=round(score, 6),
            severity=severity,
            metric="psi",
            details={
                "reference_samples": len(
                    reference
                ),
                "current_samples": len(
                    current
                ),
                "reference_mean": statistics.mean(
                    reference
                ),
                "current_mean": statistics.mean(
                    current
                ),
                "mean_shift_sigma": round(
                    self._mean_shift(
                        reference,
                        current,
                    ),
                    4,
                ),
            },
        )

    # ---------------------------------------------------------
    # Analyze everything
    # ---------------------------------------------------------

    def analyze_all(self) -> Dict:

        results = {}

        features = set(
            self.reference.keys()
        ) | set(
            self.current.keys()
        )

        for feature in features:
            results[feature] = (
                self.analyze(feature).__dict__
            )

        return results

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    def health(self) -> Dict:

        return {
            "status": "healthy",
            "features_registered": len(
                self.reference
            ),
            "features_monitored": len(
                self.current
            ),
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }