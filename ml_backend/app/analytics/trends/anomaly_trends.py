"""
Trend-based anomaly and sudden surge detection.

Detects statistical outliers, sudden hazard surges, and abrupt change-points
using rolling Z-scores, Interquartile Range (IQR), and cumulative sum (CUSUM) drift tests.
"""

from __future__ import annotations

import math
import statistics
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class TrendAnomaly:
    """An individual detected trend anomaly or surge."""

    index: int
    timestamp: str
    observed_value: float
    expected_value: float
    deviation: float
    score: float  # z-score or IQR ratio
    anomaly_type: str  # surge_spike, sharp_drop, trend_break, out_of_bounds
    severity: str  # warning, high, critical

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "observed_value": round(self.observed_value, 4),
            "expected_value": round(self.expected_value, 4),
            "deviation": round(self.deviation, 4),
            "score": round(self.score, 2),
            "anomaly_type": self.anomaly_type,
            "severity": self.severity,
        }


@dataclass
class AnomalySummary:
    """Summary of anomalies identified across a time series."""

    metric_name: str
    total_data_points: int
    total_anomalies: int
    anomaly_rate_pct: float
    critical_anomalies_count: int
    anomalies: List[TrendAnomaly] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric_name": self.metric_name,
            "total_data_points": self.total_data_points,
            "total_anomalies": self.total_anomalies,
            "anomaly_rate_pct": round(self.anomaly_rate_pct, 2),
            "critical_anomalies_count": self.critical_anomalies_count,
            "anomalies": [a.to_dict() for a in self.anomalies],
        }


class AnomalyTrendDetector:
    """
    Detects abnormal behavioral shifts and sudden hazard spikes in disaster time series.
    """

    def __init__(self, z_threshold: float = 2.5, iqr_multiplier: float = 1.5):
        self.z_threshold = z_threshold
        self.iqr_multiplier = iqr_multiplier

    def detect_zscore_anomalies(
        self,
        values: Sequence[float],
        timestamps: Optional[Sequence[str]] = None,
        metric_name: str = "metric",
        window_size: int = 10,
    ) -> AnomalySummary:
        """
        Detect spikes and drops using a rolling window Z-score.
        """
        n = len(values)
        if n < 3:
            return AnomalySummary(metric_name, n, 0, 0.0, 0, [])

        ts_list = list(timestamps) if timestamps and len(timestamps) == n else [str(i) for i in range(n)]
        anomalies: List[TrendAnomaly] = []

        for i in range(n):
            start = max(0, i - window_size)
            window = values[start:i] if i > 0 else values[:1]

            if len(window) < 2:
                continue

            mean_val = statistics.mean(window)
            std_val = statistics.stdev(window) if len(window) > 1 else 0.0

            if std_val < 1e-6:
                std_val = 1e-6

            val = values[i]
            z = (val - mean_val) / std_val

            if abs(z) >= self.z_threshold:
                dev = val - mean_val
                atype = "surge_spike" if z > 0 else "sharp_drop"
                sev = "critical" if abs(z) >= 3.5 else ("high" if abs(z) >= 3.0 else "warning")

                anomalies.append(
                    TrendAnomaly(
                        index=i,
                        timestamp=ts_list[i],
                        observed_value=val,
                        expected_value=mean_val,
                        deviation=dev,
                        score=abs(z),
                        anomaly_type=atype,
                        severity=sev,
                    )
                )

        crit_count = sum(1 for a in anomalies if a.severity == "critical")
        rate = (len(anomalies) / n * 100.0) if n > 0 else 0.0

        return AnomalySummary(
            metric_name=metric_name,
            total_data_points=n,
            total_anomalies=len(anomalies),
            anomaly_rate_pct=rate,
            critical_anomalies_count=crit_count,
            anomalies=anomalies,
        )

    def detect_cusum_drift(
        self,
        values: Sequence[float],
        timestamps: Optional[Sequence[str]] = None,
        metric_name: str = "metric",
        slack_k: float = 0.5,
        threshold_h: float = 4.0,
    ) -> List[TrendAnomaly]:
        """
        Two-sided Cumulative Sum (CUSUM) test for detecting mean shift change-points.
        """
        n = len(values)
        if n < 4:
            return []

        ts_list = list(timestamps) if timestamps and len(timestamps) == n else [str(i) for i in range(n)]
        mean_all = statistics.mean(values)
        std_all = statistics.stdev(values) if n > 1 else 1.0
        if std_all < 1e-6:
            std_all = 1.0

        # Normalized values
        z = [(v - mean_all) / std_all for v in values]

        s_pos = 0.0
        s_neg = 0.0
        change_points: List[TrendAnomaly] = []

        for i, zi in enumerate(z):
            s_pos = max(0.0, s_pos + zi - slack_k)
            s_neg = max(0.0, s_neg - zi - slack_k)

            if s_pos > threshold_h:
                change_points.append(
                    TrendAnomaly(
                        index=i,
                        timestamp=ts_list[i],
                        observed_value=values[i],
                        expected_value=mean_all,
                        deviation=values[i] - mean_all,
                        score=s_pos,
                        anomaly_type="positive_drift_shift",
                        severity="high",
                    )
                )
                s_pos = 0.0  # Reset upon alarm

            elif s_neg > threshold_h:
                change_points.append(
                    TrendAnomaly(
                        index=i,
                        timestamp=ts_list[i],
                        observed_value=values[i],
                        expected_value=mean_all,
                        deviation=values[i] - mean_all,
                        score=s_neg,
                        anomaly_type="negative_drift_shift",
                        severity="high",
                    )
                )
                s_neg = 0.0

        return change_points
