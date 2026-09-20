"""
Wildfire risk model package.

Provides:
- Model wrapper
- Feature schema and engineering
- Inference engine
- Risk classification

This package estimates wildfire hazard/risk from supplied observations.
It does not claim deterministic wildfire prediction or fire detection.
"""

from .model import (
    WildfireModel,
    WildfireModelMetadata,
    WildfireModelPrediction,
)

from .features import (
    WILDFIRE_FEATURE_NAMES,
    WildfireFeatureEngineer,
    WildfireFeatureSet,
)

from .inference import (
    WildfireInferenceEngine,
    WildfireInferenceResult,
)

__all__ = [
    "WildfireModel",
    "WildfireModelMetadata",
    "WildfireModelPrediction",
    "WILDFIRE_FEATURE_NAMES",
    "WildfireFeatureEngineer",
    "WildfireFeatureSet",
    "WildfireInferenceEngine",
    "WildfireInferenceResult",
]