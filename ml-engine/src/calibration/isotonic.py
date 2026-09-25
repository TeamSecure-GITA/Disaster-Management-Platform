from __future__ import annotations

import numpy as np
from sklearn.isotonic import IsotonicRegression


class IsotonicCalibrator:
    """Non-parametric isotonic regression calibrator ensuring monotonic probability mapping."""

    def __init__(self) -> None:
        self.calibrator = IsotonicRegression(out_of_bounds="clip", y_min=0.0, y_max=1.0)
        self.is_fitted = False

    def fit(self, y_prob: list[float] | np.ndarray, y_true: list[int] | np.ndarray) -> IsotonicCalibrator:
        probs = np.array(y_prob, dtype=float)
        targets = np.array(y_true, dtype=int)

        self.calibrator.fit(probs, targets)
        self.is_fitted = True
        return self

    def predict_proba(self, y_prob: list[float] | np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("IsotonicCalibrator must be fitted before predict_proba.")

        probs = np.array(y_prob, dtype=float)
        return self.calibrator.predict(probs)
