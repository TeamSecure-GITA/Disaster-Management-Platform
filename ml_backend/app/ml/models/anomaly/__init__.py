"""
Anomaly detection package.

Provides:
- Generic anomaly model wrapper
- Feature engineering
- Structured anomaly inference
"""

from .model import (
    AnomalyModel,
    AnomalyModelMetadata,
    AnomalyPrediction,
)

from .features import (
    ANOMALY_FEATURE_NAMES,
    AnomalyFeatureEngineer,
    AnomalyFeatureSet,
)

from .inference import (
    AnomalyInferenceEngine,
    AnomalyInferenceResult,
)

__all__ = [
    "AnomalyModel",
    "AnomalyModelMetadata",
    "AnomalyPrediction",
    "ANOMALY_FEATURE_NAMES",
    "AnomalyFeatureEngineer",
    "AnomalyFeatureSet",
    "AnomalyInferenceEngine",
    "AnomalyInferenceResult",
]