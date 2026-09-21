"""
Machine Learning model analytics and evaluation subsystem.

Provides:
- Multiclass classification, regression, and spatial IoU performance evaluations
- Expected Calibration Error (ECE) and reliability diagram binning
- Live model inference health, degradation alerts, and latency telemetry
"""

from .calibration import (
    CalibrationMetrics,
    ModelCalibrationEvaluator,
    ReliabilityBin,
)
from .monitoring import (
    ModelHealthSnapshot,
    ModelInferenceLog,
    ModelMetricsMonitor,
)
from .performance import (
    ClassificationReport,
    ModelPerformanceEvaluator,
    RegressionReport,
    SpatialOverlapMetrics,
)

__all__ = [
    "ClassificationReport",
    "RegressionReport",
    "SpatialOverlapMetrics",
    "ModelPerformanceEvaluator",
    "ReliabilityBin",
    "CalibrationMetrics",
    "ModelCalibrationEvaluator",
    "ModelInferenceLog",
    "ModelHealthSnapshot",
    "ModelMetricsMonitor",
]
