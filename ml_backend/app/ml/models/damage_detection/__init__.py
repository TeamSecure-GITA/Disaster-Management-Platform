"""
Damage detection and assessment package.

Provides:
- Generic damage classification model
- Feature engineering
- Structured damage inference

The module can consume features produced by external computer-vision,
satellite, drone, or multimodal systems.
"""

from .model import (
    DamageDetectionModel,
    DamageDetectionModelMetadata,
    DamageDetectionPrediction,
)

from .features import (
    DAMAGE_FEATURE_NAMES,
    DamageFeatureEngineer,
    DamageFeatureSet,
)

from .inference import (
    DamageDetectionInferenceEngine,
    DamageDetectionResult,
)

__all__ = [
    "DamageDetectionModel",
    "DamageDetectionModelMetadata",
    "DamageDetectionPrediction",
    "DAMAGE_FEATURE_NAMES",
    "DamageFeatureEngineer",
    "DamageFeatureSet",
    "DamageDetectionInferenceEngine",
    "DamageDetectionResult",
]