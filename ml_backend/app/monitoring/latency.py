"""
Latency monitoring.

Tracks execution time of:
- API requests
- ML inference
- AI calls
- Database queries
- External APIs
"""

from __future__ import annotations

import statistics
import time
from collections import defaultdict, deque
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Deque, Dict, Iterator


@dataclass
class LatencyStats:
    operation: str
    count: int
    mean_ms: float
    median_ms: float
    p95_ms: float
    p99_ms: float
    minimum_ms: float
    maximum_ms: float
    slow_requests: int


class LatencyMonitor:
    """
    In-memory latency monitor.

    For production, these metrics can later be exported
    to Prometheus/OpenTelemetry.
    """

    def __init__(
        self,
        max_samples: int = 10_000,
        slow_threshold_ms: float = 1000.0,
    ):
        self.max_samples = max_samples

        self.slow_threshold_ms = (
            slow_threshold_ms
        )

        self.samples: Dict[
            str,
            Deque[float]
        ] = defaultdict(
            lambda: deque(
                maxlen=self.max_samples
            )
        )

    # ---------------------------------------------------------
    # Record
    # ---------------------------------------------------------

    def record(
        self,
        operation: str,
        duration_ms: float,
    ) -> None:

        if duration_ms < 0:
            return

        self.samples[operation].append(
            float(duration_ms)
        )

    # ---------------------------------------------------------
    # Timer
    # ---------------------------------------------------------

    @contextmanager
    def timer(
        self,
        operation: str,
    ) -> Iterator[None]:

        start = time.perf_counter()

        try:
            yield

        finally:

            duration_ms = (
                time.perf_counter()
                - start
            ) * 1000

            self.record(
                operation,
                duration_ms,
            )

    # ---------------------------------------------------------
    # Percentile
    # ---------------------------------------------------------

    @staticmethod
    def _percentile(
        values,
        percentile: float,
    ) -> float:

        if not values:
            return 0.0

        values = sorted(values)

        index = (
            percentile
            / 100
            * (len(values) - 1)
        )

        lower = int(index)

        upper = min(
            lower + 1,
            len(values) - 1,
        )

        fraction = index - lower

        return (
            values[lower]
            + (
                values[upper]
                - values[lower]
            )
            * fraction
        )

    # ---------------------------------------------------------
    # Statistics
    # ---------------------------------------------------------

    def statistics(
        self,
        operation: str,
    ) -> LatencyStats:

        values = list(
            self.samples.get(
                operation,
                []
            )
        )

        if not values:
            return LatencyStats(
                operation=operation,
                count=0,
                mean_ms=0.0,
                median_ms=0.0,
                p95_ms=0.0,
                p99_ms=0.0,
                minimum_ms=0.0,
                maximum_ms=0.0,
                slow_requests=0,
            )

        slow_requests = sum(
            1
            for value in values
            if value
            >= self.slow_threshold_ms
        )

        return LatencyStats(
            operation=operation,
            count=len(values),
            mean_ms=round(
                statistics.mean(values),
                3,
            ),
            median_ms=round(
                statistics.median(values),
                3,
            ),
            p95_ms=round(
                self._percentile(
                    values,
                    95,
                ),
                3,
            ),
            p99_ms=round(
                self._percentile(
                    values,
                    99,
                ),
                3,
            ),
            minimum_ms=round(
                min(values),
                3,
            ),
            maximum_ms=round(
                max(values),
                3,
            ),
            slow_requests=slow_requests,
        )

    # ---------------------------------------------------------
    # All operations
    # ---------------------------------------------------------

    def all_statistics(self) -> Dict:

        return {
            operation: self.statistics(
                operation
            ).__dict__
            for operation in self.samples
        }

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    def health(self) -> Dict:

        stats = self.all_statistics()

        return {
            "status": "healthy",
            "operations": len(stats),
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }