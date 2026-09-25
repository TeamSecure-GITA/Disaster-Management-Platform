from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd


class ShapAnalyzer:
    """Computes Shapley additive explanations (global summary and local per-instance attributions)."""

    def __init__(self, model: Any, background_data: pd.DataFrame | np.ndarray | None = None) -> None:
        self.model = model
        self.background_data = (
            np.array(background_data) if background_data is not None else None
        )

    def explain_instance(
        self, instance: pd.Series | np.ndarray, feature_names: list[str], n_samples: int = 50
    ) -> dict[str, float]:
        """Compute sample-based marginal Shapley attributions for a single observation."""
        x = np.array(instance, dtype=float).ravel()
        p = len(x)

        if self.background_data is None:
            # Baseline is zero vector or random normal
            baseline = np.zeros(p)
        else:
            baseline = np.mean(self.background_data, axis=0)

        # Predict base and full
        def predict_val(vec: np.ndarray) -> float:
            vec_2d = vec.reshape(1, -1)
            if hasattr(self.model, "predict_proba"):
                try:
                    return float(self.model.predict_proba(vec_2d)[0, 1])
                except Exception:
                    pass
            return float(self.model.predict(vec_2d)[0])

        phi = np.zeros(p)
        base_val = predict_val(baseline)
        full_val = predict_val(x)
        delta_total = full_val - base_val

        # Approximate marginal contributions across random feature subsets
        for _ in range(n_samples):
            perm = np.random.permutation(p)
            current_vec = baseline.copy()
            for idx in perm:
                prev_vec = current_vec.copy()
                current_vec[idx] = x[idx]
                contrib = predict_val(current_vec) - predict_val(prev_vec)
                phi[idx] += contrib

        phi = phi / max(n_samples, 1)

        # Scale to strictly sum to total prediction delta
        sum_phi = np.sum(phi)
        if abs(sum_phi) > 1e-6 and abs(delta_total) > 1e-6:
            phi = phi * (delta_total / sum_phi)

        return {
            name: round(float(val), 4)
            for name, val in zip(feature_names, phi)
        }

    def explain_global(
        self, X: pd.DataFrame | np.ndarray, feature_names: list[str], sample_size: int = 30
    ) -> list[dict[str, Any]]:
        """Compute mean absolute SHAP values across representative instances."""
        X_arr = np.array(X)
        indices = np.random.choice(len(X_arr), min(len(X_arr), sample_size), replace=False)

        all_attributions = []
        for idx in indices:
            attrs = self.explain_instance(X_arr[idx], feature_names, n_samples=20)
            all_attributions.append(attrs)

        df_attrs = pd.DataFrame(all_attributions)
        mean_abs_shap = df_attrs.abs().mean().to_dict()

        ranked = [
            {"feature": k, "mean_abs_shap": round(float(v), 4)}
            for k, v in mean_abs_shap.items()
        ]
        ranked.sort(key=lambda x: x["mean_abs_shap"], reverse=True)
        return ranked
