"""
Realtime aggregation pipeline and helpers.
Exposes aggregation window logic and summaries.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence
from .aggregations import (
    AggregationWindow,
    AggregatedMetric,
    DimensionalAggregate,
    RealtimeAggregator,
)

__all__ = [
    "AggregationWindow",
    "AggregatedMetric",
    "DimensionalAggregate",
    "RealtimeAggregator",
    "aggregate_realtime_metrics",
]


def aggregate_realtime_metrics(
    values: Sequence[float],
    window_seconds: int = 300,
    metric_name: str = "telemetry",
) -> Dict[str, Any]:
    """Helper for one-shot window aggregation."""
    start_t = 0.0
    end_t = float(window_seconds)
    metric = RealtimeAggregator.aggregate_points(metric_name, list(values), start_t, end_t)
    return metric.to_dict() if metric else {}
