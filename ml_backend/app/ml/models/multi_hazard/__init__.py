"""
Multi-hazard risk aggregation package.

Combines outputs from individual hazard models such as:
- Landslide
- Flood
- Cyclone
- Earthquake
- Wildfire

This package performs risk aggregation and interaction analysis.
It does not create unsupported hazard predictions.
"""

from .model import (
    MultiHazardModel,
    MultiHazardModelMetadata,
    MultiHazardPrediction,
)

from .features import (
    MULTI_HAZARD_FEATURE_NAMES,
    MultiHazardFeatureEngineer,
    MultiHazardFeatureSet,
)

from .inference import (
    MultiHazardInferenceEngine,
    MultiHazardInferenceResult,
)

__all__ = [
    "MultiHazardModel",
    "MultiHazardModelMetadata",
    "MultiHazardPrediction",
    "MULTI_HAZARD_FEATURE_NAMES",
    "MultiHazardFeatureEngineer",
    "MultiHazardFeatureSet",
    "MultiHazardInferenceEngine",
    "MultiHazardInferenceResult",
]