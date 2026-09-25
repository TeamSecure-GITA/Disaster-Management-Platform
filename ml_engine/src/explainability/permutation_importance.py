from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance


class PermutationImportanceAnalyzer:
    """Calculates model-agnostic permutation feature importance via scoring drops."""

    @staticmethod
    def compute(
        model: Any,
        X_test: pd.DataFrame | np.ndarray,
        y_test: pd.Series | np.ndarray,
        feature_names: list[str],
        scoring: str = "f1_weighted",
        n_repeats: int = 5,
        random_state: int = 42,
    ) -> list[dict[str, Any]]:
        X_arr = np.array(X_test)
        y_arr = np.array(y_test)

        perm = permutation_importance(
            model,
            X_arr,
            y_arr,
            scoring=scoring,
            n_repeats=n_repeats,
            random_state=random_state,
        )

        results = []
        for name, mean_score, std_score in zip(feature_names, perm.importances_mean, perm.importances_std):
            results.append({
                "feature": name,
                "importance_mean": float(mean_score),
                "importance_std": float(std_score),
            })

        results.sort(key=lambda x: x["importance_mean"], reverse=True)
        return results
