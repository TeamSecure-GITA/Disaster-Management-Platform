from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from sklearn.inspection import partial_dependence


class PartialDependenceAnalyzer:
    """Computes partial dependence plots (PDP) for target risk response curves."""

    @staticmethod
    def compute_1d(
        model: Any,
        X: pd.DataFrame | np.ndarray,
        feature_index: int,
        feature_name: str,
        grid_resolution: int = 25,
    ) -> dict[str, Any]:
        X_arr = np.array(X)

        pdp_res = partial_dependence(
            model,
            X_arr,
            features=[feature_index],
            grid_resolution=grid_resolution,
            kind="average",
        )

        grid_values = pdp_res["grid_values"][0].tolist()
        # average response curve
        avg_response = pdp_res["average"][0].tolist()

        return {
            "feature": feature_name,
            "grid_values": grid_values,
            "average_response": avg_response,
        }
