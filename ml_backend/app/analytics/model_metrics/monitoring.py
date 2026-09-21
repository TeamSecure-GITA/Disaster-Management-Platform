"""
Continuous ML model production health and performance monitoring.

Tracks rolling model inference metrics, latency distributions, degradation alerts,
and comparative benchmarks across disaster prediction model versions.
"""

from __future__ import annotations

import statistics
import time
from collections import defaultdict, deque
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Deque, Dict, List, Optional, Sequence


@dataclass
class ModelInferenceLog:
    """Record of an individual model inference run."""

    model_name: str
    version: str
    latency_ms: float
    confidence: float
    timestamp: float = field(default_factory=time.time)
    error: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ModelHealthSnapshot:
    """Current health and quality snapshot of a monitored model."""

    model_name: str
    version: str
    total_inferences: int
    error_rate_pct: float
    avg_latency_ms: float
    p95_latency_ms: float
    avg_confidence: float
    status: str  # healthy, degraded, critical_latency, high_error_rate
    last_evaluated: str
    active_warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "version": self.version,
            "total_inferences": self.total_inferences,
            "error_rate_pct": round(self.error_rate_pct, 2),
            "avg_latency_ms": round(self.avg_latency_ms, 2),
            "p95_latency_ms": round(self.p95_latency_ms, 2),
            "avg_confidence": round(self.avg_confidence, 4),
            "status": self.status,
            "last_evaluated": self.last_evaluated,
            "active_warnings": self.active_warnings,
        }


class ModelMetricsMonitor:
    """
    In-memory registry and runtime telemetry tracker for production disaster prediction models.
    """

    def __init__(
        self,
        max_history_per_model: int = 2000,
        latency_warning_threshold_ms: float = 300.0,
        error_rate_threshold_pct: float = 2.0,
    ):
        self.max_history_per_model = max_history_per_model
        self.latency_warning_threshold_ms = latency_warning_threshold_ms
        self.error_rate_threshold_pct = error_rate_threshold_pct
        self._history: Dict[str, Deque[ModelInferenceLog]] = defaultdict(
            lambda: deque(maxlen=self.max_history_per_model)
        )

    def record_inference(
        self,
        model_name: str,
        version: str = "1.0.0",
        latency_ms: float = 50.0,
        confidence: float = 0.95,
        error: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Log an inference invocation."""
        log = ModelInferenceLog(
            model_name=model_name,
            version=version,
            latency_ms=latency_ms,
            confidence=confidence,
            timestamp=time.time(),
            error=error,
            metadata=metadata or {},
        )
        self._history[model_name].append(log)

    def get_health_snapshot(self, model_name: str) -> Optional[ModelHealthSnapshot]:
        """Compute rolling operational metrics for a specific model."""
        logs = self._history.get(model_name)
        if not logs:
            return None

        n = len(logs)
        errors = sum(1 for l in logs if l.error)
        err_rate = (errors / n) * 100.0

        latencies = sorted([l.latency_ms for l in logs])
        avg_lat = statistics.mean(latencies)
        p95_idx = int(0.95 * (n - 1))
        p95_lat = latencies[min(p95_idx, n - 1)]

        confidences = [l.confidence for l in logs if not l.error]
        avg_conf = statistics.mean(confidences) if confidences else 0.0

        latest_version = logs[-1].version

        warnings = []
        status = "healthy"

        if err_rate > self.error_rate_threshold_pct:
            status = "high_error_rate"
            warnings.append(f"Error rate is {err_rate:.1f}% (threshold {self.error_rate_threshold_pct}%)")

        if p95_lat > self.latency_warning_threshold_ms:
            if status == "healthy":
                status = "degraded"
            warnings.append(
                f"P95 latency is {p95_lat:.1f}ms (threshold {self.latency_warning_threshold_ms}ms)"
            )

        if avg_conf < 0.65:
            warnings.append(f"Low average model confidence: {avg_conf:.2f}")

        return ModelHealthSnapshot(
            model_name=model_name,
            version=latest_version,
            total_inferences=n,
            error_rate_pct=err_rate,
            avg_latency_ms=avg_lat,
            p95_latency_ms=p95_lat,
            avg_confidence=avg_conf,
            status=status,
            last_evaluated=datetime.now(timezone.utc).isoformat(),
            active_warnings=warnings,
        )

    def get_all_snapshots(self) -> Dict[str, Dict[str, Any]]:
        """Return snapshots for all currently monitored models."""
        results: Dict[str, Dict[str, Any]] = {}
        for m_name in list(self._history.keys()):
            snap = self.get_health_snapshot(m_name)
            if snap:
                results[m_name] = snap.to_dict()
        return results
