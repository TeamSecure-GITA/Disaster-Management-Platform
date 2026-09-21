"""
Real-time aggregations for situational disaster telemetry.

Provides time-bucketed aggregations (sliding/tumbling windows) and dimensional breakdowns
(by region, hazard category, severity, and response status).
"""

from __future__ import annotations

import math
import statistics
import time
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class AggregationWindow:
    """Represents an aggregation time bucket."""

    window_size_seconds: int
    start_time: float
    end_time: float

    @property
    def start_iso(self) -> str:
        return datetime.fromtimestamp(self.start_time, tz=timezone.utc).isoformat()

    @property
    def end_iso(self) -> str:
        return datetime.fromtimestamp(self.end_time, tz=timezone.utc).isoformat()


@dataclass
class AggregatedMetric:
    """Aggregated numerical result within a window."""

    metric_name: str
    window: AggregationWindow
    count: int
    sum: float
    mean: float
    min: float
    max: float
    std_dev: float
    p50: float
    p90: float
    p99: float
    rate_per_second: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric_name": self.metric_name,
            "window_start": self.window.start_iso,
            "window_end": self.window.end_iso,
            "window_seconds": self.window.window_size_seconds,
            "count": self.count,
            "sum": round(self.sum, 4),
            "mean": round(self.mean, 4),
            "min": round(self.min, 4),
            "max": round(self.max, 4),
            "std_dev": round(self.std_dev, 4),
            "p50": round(self.p50, 4),
            "p90": round(self.p90, 4),
            "p99": round(self.p99, 4),
            "rate_per_second": round(self.rate_per_second, 4),
        }


@dataclass
class DimensionalAggregate:
    """Aggregation partitioned across categorical dimensions."""

    dimension: str
    category_counts: Dict[str, int] = field(default_factory=dict)
    category_values: Dict[str, float] = field(default_factory=dict)
    category_percentages: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class RealtimeAggregator:
    """
    Computes streaming aggregations across temporal windows and operational dimensions.
    """

    def __init__(self):
        pass

    @staticmethod
    def aggregate_points(
        metric_name: str,
        values: Sequence[float],
        start_time: float,
        end_time: float,
    ) -> AggregatedMetric:
        """Compute summary statistics for a raw sequence of values over a window."""
        window_duration = max(end_time - start_time, 1.0)
        window = AggregationWindow(
            window_size_seconds=int(window_duration),
            start_time=start_time,
            end_time=end_time,
        )

        if not values:
            return AggregatedMetric(
                metric_name=metric_name,
                window=window,
                count=0,
                sum=0.0,
                mean=0.0,
                min=0.0,
                max=0.0,
                std_dev=0.0,
                p50=0.0,
                p90=0.0,
                p99=0.0,
                rate_per_second=0.0,
            )

        n = len(values)
        total = sum(values)
        mean_val = total / n
        sorted_vals = sorted(values)
        std_val = statistics.stdev(values) if n > 1 else 0.0

        def pct(p: float) -> float:
            idx = int(p * (n - 1))
            return sorted_vals[min(idx, n - 1)]

        return AggregatedMetric(
            metric_name=metric_name,
            window=window,
            count=n,
            sum=total,
            mean=mean_val,
            min=sorted_vals[0],
            max=sorted_vals[-1],
            std_dev=std_val,
            p50=pct(0.50),
            p90=pct(0.90),
            p99=pct(0.99),
            rate_per_second=n / window_duration,
        )

    @staticmethod
    def bucket_by_time(
        events: List[Dict[str, Any]],
        value_key: str = "value",
        timestamp_key: str = "timestamp",
        bucket_seconds: int = 60,
    ) -> List[Dict[str, Any]]:
        """
        Group stream events into fixed uniform time buckets.
        """
        if not events:
            return []

        buckets: Dict[int, List[float]] = defaultdict(list)
        for ev in events:
            raw_ts = ev.get(timestamp_key, time.time())
            if isinstance(raw_ts, str):
                try:
                    ts = datetime.fromisoformat(raw_ts).timestamp()
                except ValueError:
                    ts = time.time()
            else:
                ts = float(raw_ts)

            val = float(ev.get(value_key, 1.0))
            bucket_idx = int(ts // bucket_seconds) * bucket_seconds
            buckets[bucket_idx].append(val)

        results = []
        for b_time in sorted(buckets.keys()):
            vals = buckets[b_time]
            results.append({
                "bucket_time": datetime.fromtimestamp(b_time, tz=timezone.utc).isoformat(),
                "count": len(vals),
                "sum": round(sum(vals), 4),
                "mean": round(statistics.mean(vals), 4),
                "min": round(min(vals), 4),
                "max": round(max(vals), 4),
            })
        return results

    @staticmethod
    def aggregate_by_dimension(
        items: List[Dict[str, Any]],
        dimension_key: str,
        value_key: Optional[str] = None,
    ) -> DimensionalAggregate:
        """
        Group events by categorical dimension (e.g. 'region', 'hazard_type', 'severity').
        """
        counts: Dict[str, int] = defaultdict(int)
        values: Dict[str, float] = defaultdict(float)

        total_count = len(items)
        for item in items:
            cat = str(item.get(dimension_key, "unknown"))
            counts[cat] += 1
            if value_key and value_key in item:
                try:
                    values[cat] += float(item[value_key])
                except (ValueError, TypeError):
                    pass

        pcts = {}
        for cat, c in counts.items():
            pcts[cat] = round((c / total_count * 100.0) if total_count > 0 else 0.0, 2)

        return DimensionalAggregate(
            dimension=dimension_key,
            category_counts=dict(counts),
            category_values={k: round(v, 4) for k, v in values.items()} if value_key else {},
            category_percentages=pcts,
        )

    @staticmethod
    def compute_rate_of_change(
        current_count: float,
        previous_count: float,
        period_seconds: float = 300.0,
    ) -> Dict[str, Any]:
        """Calculate operational acceleration and velocity between two consecutive intervals."""
        diff = current_count - previous_count
        pct_change = ((diff / previous_count) * 100.0) if previous_count > 0 else (100.0 if current_count > 0 else 0.0)
        rate_per_min = (diff / period_seconds) * 60.0

        trend = "stable"
        if pct_change >= 10.0:
            trend = "surging"
        elif pct_change > 0:
            trend = "increasing"
        elif pct_change <= -10.0:
            trend = "declining_rapidly"
        elif pct_change < 0:
            trend = "decreasing"

        return {
            "absolute_change": round(diff, 4),
            "percentage_change": round(pct_change, 2),
            "rate_per_minute": round(rate_per_min, 4),
            "trend": trend,
            "period_seconds": period_seconds,
        }
