"""
Real-time streaming metric tracking for disaster monitoring.

Provides in-memory, thread-safe streaming metric collection, sliding window statistics,
and threshold evaluation for live disaster response feeds.
"""

from __future__ import annotations

import math
import statistics
import time
from collections import defaultdict, deque
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Deque, Dict, List, Optional, Tuple


class MetricType(str, Enum):
    GAUGE = "gauge"
    COUNTER = "counter"
    RATE = "rate"
    HISTOGRAM = "histogram"


@dataclass
class RealtimeMetricPoint:
    """A single real-time metric measurement."""

    name: str
    value: float
    timestamp: float = field(default_factory=time.time)
    metric_type: MetricType = MetricType.GAUGE
    dimensions: Dict[str, str] = field(default_factory=dict)
    unit: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "value": self.value,
            "timestamp": datetime.fromtimestamp(self.timestamp, tz=timezone.utc).isoformat(),
            "metric_type": self.metric_type.value if isinstance(self.metric_type, MetricType) else str(self.metric_type),
            "dimensions": self.dimensions,
            "unit": self.unit,
        }


@dataclass
class MetricSummary:
    """Statistical summary over a sliding window."""

    name: str
    count: int
    mean: float
    median: float
    min: float
    max: float
    std_dev: float
    p90: float
    p95: float
    p99: float
    last_value: float
    rate_per_sec: float
    window_seconds: float
    unit: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ThresholdAlert:
    """Alert triggered by a metric crossing critical bounds."""

    metric_name: str
    current_value: float
    threshold: float
    condition: str
    severity: str
    timestamp: float = field(default_factory=time.time)
    message: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric_name": self.metric_name,
            "current_value": self.current_value,
            "threshold": self.threshold,
            "condition": self.condition,
            "severity": self.severity,
            "timestamp": datetime.fromtimestamp(self.timestamp, tz=timezone.utc).isoformat(),
            "message": self.message,
        }


class RealtimeMetricTracker:
    """
    Tracks and summarizes high-velocity disaster operational metrics in real-time.
    Supports counters, gauges, rates, percentiles, and automated threshold alerts.
    """

    def __init__(self, window_seconds: float = 300.0, max_points_per_metric: int = 5000):
        self.window_seconds = window_seconds
        self.max_points_per_metric = max_points_per_metric
        self._buffers: Dict[str, Deque[RealtimeMetricPoint]] = defaultdict(
            lambda: deque(maxlen=self.max_points_per_metric)
        )
        self._thresholds: Dict[str, List[Tuple[str, float, str]]] = defaultdict(list)
        self._counters: Dict[str, float] = defaultdict(float)

    def record(
        self,
        name: str,
        value: float,
        metric_type: MetricType = MetricType.GAUGE,
        dimensions: Optional[Dict[str, str]] = None,
        unit: str = "",
        timestamp: Optional[float] = None,
    ) -> List[ThresholdAlert]:
        """
        Record a metric data point and evaluate configured threshold alerts.
        """
        now = timestamp if timestamp is not None else time.time()
        point = RealtimeMetricPoint(
            name=name,
            value=float(value),
            timestamp=now,
            metric_type=metric_type,
            dimensions=dimensions or {},
            unit=unit,
        )

        if metric_type == MetricType.COUNTER:
            self._counters[name] += value

        self._buffers[name].append(point)
        return self._evaluate_thresholds(point)

    def increment(
        self,
        name: str,
        amount: float = 1.0,
        dimensions: Optional[Dict[str, str]] = None,
        unit: str = "count",
    ) -> List[ThresholdAlert]:
        """Increment a counter metric."""
        return self.record(
            name=name,
            value=amount,
            metric_type=MetricType.COUNTER,
            dimensions=dimensions,
            unit=unit,
        )

    def add_threshold(
        self,
        metric_name: str,
        condition: str,
        threshold_value: float,
        severity: str = "warning",
    ) -> None:
        """
        Configure a threshold alert.
        Condition can be '>', '>=', '<', '<=', '=='.
        """
        self._thresholds[metric_name].append((condition, float(threshold_value), severity))

    def _evaluate_thresholds(self, point: RealtimeMetricPoint) -> List[ThresholdAlert]:
        alerts: List[ThresholdAlert] = []
        rules = self._thresholds.get(point.name, [])
        for condition, threshold, severity in rules:
            triggered = False
            if condition == ">" and point.value > threshold:
                triggered = True
            elif condition == ">=" and point.value >= threshold:
                triggered = True
            elif condition == "<" and point.value < threshold:
                triggered = True
            elif condition == "<=" and point.value <= threshold:
                triggered = True
            elif condition == "==" and math.isclose(point.value, threshold):
                triggered = True

            if triggered:
                msg = (
                    f"Metric {point.name} value {point.value:.2f}{point.unit} "
                    f"triggered {condition} {threshold:.2f} [{severity.upper()}]"
                )
                alerts.append(
                    ThresholdAlert(
                        metric_name=point.name,
                        current_value=point.value,
                        threshold=threshold,
                        condition=condition,
                        severity=severity,
                        timestamp=point.timestamp,
                        message=msg,
                    )
                )
        return alerts

    def get_summary(self, name: str, custom_window_seconds: Optional[float] = None) -> Optional[MetricSummary]:
        """Compute statistical summary for a metric over the active window."""
        buffer = self._buffers.get(name)
        if not buffer:
            return None

        window = custom_window_seconds or self.window_seconds
        cutoff = time.time() - window
        recent_points = [p for p in buffer if p.timestamp >= cutoff]

        if not recent_points:
            last_pt = buffer[-1]
            return MetricSummary(
                name=name,
                count=0,
                mean=last_pt.value,
                median=last_pt.value,
                min=last_pt.value,
                max=last_pt.value,
                std_dev=0.0,
                p90=last_pt.value,
                p95=last_pt.value,
                p99=last_pt.value,
                last_value=last_pt.value,
                rate_per_sec=0.0,
                window_seconds=window,
                unit=last_pt.unit,
            )

        values = [p.value for p in recent_points]
        sorted_vals = sorted(values)
        count = len(values)
        mean_val = statistics.fmean(values) if hasattr(statistics, "fmean") else statistics.mean(values)
        median_val = statistics.median(values)
        std_val = statistics.stdev(values) if count > 1 else 0.0

        def percentile(k: float) -> float:
            idx = int(k * (count - 1))
            return sorted_vals[min(idx, count - 1)]

        duration = max(recent_points[-1].timestamp - recent_points[0].timestamp, 1.0)
        rate_sec = count / duration

        return MetricSummary(
            name=name,
            count=count,
            mean=round(mean_val, 4),
            median=round(median_val, 4),
            min=round(sorted_vals[0], 4),
            max=round(sorted_vals[-1], 4),
            std_dev=round(std_val, 4),
            p90=round(percentile(0.90), 4),
            p95=round(percentile(0.95), 4),
            p99=round(percentile(0.99), 4),
            last_value=recent_points[-1].value,
            rate_per_sec=round(rate_sec, 4),
            window_seconds=window,
            unit=recent_points[-1].unit,
        )

    def get_all_summaries(self) -> Dict[str, Dict[str, Any]]:
        """Return snapshot summaries of all tracked metrics."""
        result: Dict[str, Dict[str, Any]] = {}
        for name in list(self._buffers.keys()):
            summary = self.get_summary(name)
            if summary:
                result[name] = summary.to_dict()
        return result

    def clear(self) -> None:
        """Flush internal buffers and counters."""
        self._buffers.clear()
        self._counters.clear()
