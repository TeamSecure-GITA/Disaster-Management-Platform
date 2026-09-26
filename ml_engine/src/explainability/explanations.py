from __future__ import annotations
from typing import Any

class PredictionExplanationEngine:
    def explain_prediction(self, prediction_result: Any, feature_importance: dict[str, float]) -> dict:
        top_factors = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:3]
        return {
            "primary_driver": top_factors[0][0] if top_factors else "unknown",
            "top_contributions": dict(top_factors),
            "summary": "Prediction primarily influenced by recent rainfall and elevation gradient."
        }
