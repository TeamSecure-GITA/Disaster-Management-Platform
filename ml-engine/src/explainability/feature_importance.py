from __future__ import annotations

from typing import Any
import numpy as np


class FeatureImportanceAnalyzer:
    """Extracts, ranks, and normalizes model-intrinsic feature importance scores."""

    @staticmethod
    def extract_importance(model: Any, feature_names: list[str]) -> list[dict[str, Any]]:
        raw_importances = None

        if hasattr(model, "feature_importances_"):
            raw_importances = np.array(model.feature_importances_, dtype=float)
        elif hasattr(model, "coef_"):
            # For linear models, take magnitude of coefficients
            coef = np.array(model.coef_, dtype=float)
            if coef.ndim > 1:
                coef = np.mean(np.abs(coef), axis=0)
            raw_importances = np.abs(coef)

        if raw_importances is None:
            # Fallback uniform
            raw_importances = np.ones(len(feature_names)) / max(len(feature_names), 1)

        # Normalize to sum to 1.0
        total = np.sum(raw_importances)
        normalized = raw_importances / total if total > 0 else raw_importances

        results = []
        for name, score, norm_score in zip(feature_names, raw_importances, normalized):
            results.append({
                "feature": name,
                "importance": float(score),
                "relative_importance_pct": round(float(norm_score) * 100.0, 2),
            })

        # Sort descending by importance
        results.sort(key=lambda x: x["importance"], reverse=True)

        cumulative = 0.0
        for item in results:
            cumulative += item["relative_importance_pct"]
            item["cumulative_importance_pct"] = round(cumulative, 2)

        return results
