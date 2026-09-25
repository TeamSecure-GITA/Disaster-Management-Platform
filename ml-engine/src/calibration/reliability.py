from __future__ import annotations

from typing import Any
import numpy as np
from sklearn.calibration import calibration_curve


class ReliabilityDiagram:
    """Computes calibration curves, Expected Calibration Error (ECE), and Maximum Calibration Error (MCE)."""

    def __init__(self, n_bins: int = 10, strategy: str = "uniform") -> None:
        self.n_bins = n_bins
        self.strategy = strategy

    def compute(
        self, y_true: list[int] | np.ndarray, y_prob: list[float] | np.ndarray
    ) -> dict[str, Any]:
        yt = np.array(y_true, dtype=int)
        yp = np.array(y_prob, dtype=float)

        prob_true, prob_pred = calibration_curve(yt, yp, n_bins=self.n_bins, strategy=self.strategy)

        # Expected Calibration Error (ECE) and Maximum Calibration Error (MCE)
        bin_edges = np.linspace(0.0, 1.0, self.n_bins + 1)
        bin_assignments = np.digitize(yp, bin_edges) - 1
        bin_assignments = np.clip(bin_assignments, 0, self.n_bins - 1)

        total_samples = len(yp)
        ece = 0.0
        mce = 0.0
        bin_details = []

        for b in range(self.n_bins):
            mask = bin_assignments == b
            bin_size = int(np.sum(mask))
            if bin_size > 0:
                bin_acc = float(np.mean(yt[mask]))
                bin_conf = float(np.mean(yp[mask]))
                diff = abs(bin_acc - bin_conf)
                ece += (bin_size / total_samples) * diff
                mce = max(mce, diff)
                bin_details.append({
                    "bin_index": b,
                    "bin_range": [float(bin_edges[b]), float(bin_edges[b + 1])],
                    "sample_count": bin_size,
                    "accuracy": bin_acc,
                    "confidence": bin_conf,
                    "calibration_gap": diff,
                })

        return {
            "expected_calibration_error_ece": float(ece),
            "maximum_calibration_error_mce": float(mce),
            "prob_true": prob_true.tolist(),
            "prob_pred": prob_pred.tolist(),
            "bins": bin_details,
        }
