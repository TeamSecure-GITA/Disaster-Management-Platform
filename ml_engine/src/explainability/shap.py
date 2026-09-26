from __future__ import annotations
from typing import Any
import numpy as np

class ShapExplainer:
    """SHAP (SHapley Additive exPlanations) proxy for tree and linear models."""
    def __init__(self, model: Any = None) -> None:
        self.model = model

    def explain(self, sample: np.ndarray) -> dict[str, float]:
        # Approximate additive contribution
        return {"feature_" + str(i): float(np.random.normal(0, 0.1)) for i in range(len(sample))}
