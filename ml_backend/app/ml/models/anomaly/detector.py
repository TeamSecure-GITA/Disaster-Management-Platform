"""
High-level anomaly detection interface and algorithms for sensor telemetry.
Provides statistical (Z-Score, IQR) and machine learning (Isolation Forest) detectors.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from .model import AnomalyModel, AnomalyPrediction


@dataclass
class AnomalyDetectionResult:
    """Structured output for anomaly detection evaluation."""
    is_anomaly: bool
    anomaly_score: float  # Normalized 0.0 to 1.0 (higher = more anomalous)
    method: str
    metric_name: str
    observed_value: float
    expected_range: tuple[float, float]
    severity: str  # "normal", "low", "medium", "high", "critical"
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_anomaly": self.is_anomaly,
            "anomaly_score": round(self.anomaly_score, 4),
            "method": self.method,
            "metric_name": self.metric_name,
            "observed_value": self.observed_value,
            "expected_range": self.expected_range,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "details": self.details,
        }


class StatisticalAnomalyDetector:
    """Statistical outlier detector using moving Z-Score and Interquartile Range (IQR)."""

    def __init__(self, z_threshold: float = 3.0, iqr_multiplier: float = 1.5):
        self.z_threshold = z_threshold
        self.iqr_multiplier = iqr_multiplier

    def detect_zscore(
        self,
        value: float,
        history: Sequence[float],
        metric_name: str = "sensor_metric",
    ) -> AnomalyDetectionResult:
        if len(history) < 3:
            return AnomalyDetectionResult(
                is_anomaly=False,
                anomaly_score=0.0,
                method="z_score",
                metric_name=metric_name,
                observed_value=value,
                expected_range=(value, value),
                severity="normal",
                details={"reason": "Insufficient history for baseline"},
            )

        arr = np.array(history, dtype=float)
        mean = float(np.mean(arr))
        std = float(np.std(arr))

        if std < 1e-6:
            std = 1e-6

        z_score = abs(value - mean) / std
        is_anomaly = bool(z_score > self.z_threshold)
        score = float(min(1.0, z_score / (self.z_threshold * 2.0)))

        if score > 0.8:
            severity = "critical"
        elif score > 0.6:
            severity = "high"
        elif score > 0.4:
            severity = "medium"
        elif is_anomaly:
            severity = "low"
        else:
            severity = "normal"

        low_bound = mean - self.z_threshold * std
        high_bound = mean + self.z_threshold * std

        return AnomalyDetectionResult(
            is_anomaly=is_anomaly,
            anomaly_score=score,
            method="z_score",
            metric_name=metric_name,
            observed_value=value,
            expected_range=(round(low_bound, 3), round(high_bound, 3)),
            severity=severity,
            details={"z_score": round(z_score, 3), "baseline_mean": round(mean, 3), "baseline_std": round(std, 3)},
        )

    def detect_iqr(
        self,
        value: float,
        history: Sequence[float],
        metric_name: str = "sensor_metric",
    ) -> AnomalyDetectionResult:
        if len(history) < 4:
            return self.detect_zscore(value, history, metric_name)

        arr = np.sort(np.array(history, dtype=float))
        q25 = float(np.percentile(arr, 25))
        q75 = float(np.percentile(arr, 75))
        iqr = q75 - q25

        if iqr < 1e-6:
            iqr = 1e-6

        lower_bound = q25 - (self.iqr_multiplier * iqr)
        upper_bound = q75 + (self.iqr_multiplier * iqr)

        is_anomaly = bool(value < lower_bound or value > upper_bound)
        dev = max(0.0, lower_bound - value) if value < lower_bound else max(0.0, value - upper_bound)
        score = float(min(1.0, dev / (iqr * 2.0)))

        severity = "critical" if score > 0.75 else "high" if score > 0.5 else "medium" if is_anomaly else "normal"

        return AnomalyDetectionResult(
            is_anomaly=is_anomaly,
            anomaly_score=score,
            method="iqr",
            metric_name=metric_name,
            observed_value=value,
            expected_range=(round(lower_bound, 3), round(upper_bound, 3)),
            severity=severity,
            details={"q25": round(q25, 3), "q75": round(q75, 3), "iqr": round(iqr, 3)},
        )


class AnomalyDetector:
    """Unified detector coordinating statistical baselines and machine learning models."""

    def __init__(self, ml_model: Optional[AnomalyModel] = None):
        self.ml_model = ml_model
        self.statistical = StatisticalAnomalyDetector()

    def analyze_stream_point(
        self,
        metric_name: str,
        value: float,
        history: Sequence[float],
    ) -> AnomalyDetectionResult:
        """Analyzes a single streaming data point using statistical thresholding."""
        return self.statistical.detect_zscore(value, history, metric_name=metric_name)

    def analyze_feature_vector(
        self,
        features: Dict[str, float],
    ) -> Dict[str, Any]:
        """Runs ML model inference if trained, else falls back to robust heuristic."""
        if self.ml_model and self.ml_model.metadata.trained:
            pred = self.ml_model.predict([features])
            return pred.to_dict()

        # Fallback scoring
        scores = [abs(v) for v in features.values() if isinstance(v, (int, float))]
        avg_score = float(np.mean(scores)) if scores else 0.0
        norm_score = float(1.0 / (1.0 + math.exp(-avg_score / 100.0))) if avg_score > 0 else 0.0
        return {
            "is_anomaly": norm_score > 0.7,
            "anomaly_score": norm_score,
            "model_type": "heuristic_fallback",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
