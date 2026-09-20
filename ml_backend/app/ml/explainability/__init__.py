"""
ML explainability utilities.

Supports:
- SHAP-compatible explainers
- Feature importance
- Human-readable model explanations
"""

from .shap import (
    SHAPExplainer,
    SHAPExplanation,
)

from .feature_importance import (
    FeatureImportanceAnalyzer,
    FeatureImportanceResult,
)

from .explanations import (
    ModelExplanation,
    ExplanationGenerator,
)

__all__ = [
    "SHAPExplainer",
    "SHAPExplanation",
    "FeatureImportanceAnalyzer",
    "FeatureImportanceResult",
    "ModelExplanation",
    "ExplanationGenerator",
]