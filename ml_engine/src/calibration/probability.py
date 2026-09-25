from __future__ import annotations

import numpy as np
from sklearn.linear_model import LogisticRegression


class ProbabilityCalibrator:
    """Calibrates uncalibrated model confidence probabilities using Platt Scaling (Sigmoid)."""

    def __init__(self) -> None:
        self.calibrator = LogisticRegression(C=1.0, solver="lbfgs")
        self.is_fitted = False

    def fit(self, y_prob: list[float] | np.ndarray, y_true: list[int] | np.ndarray) -> ProbabilityCalibrator:
        probs = np.array(y_prob, dtype=float).clip(1e-6, 1.0 - 1e-6)
        # Logit transform
        logits = np.log(probs / (1.0 - probs)).reshape(-1, 1)
        targets = np.array(y_true, dtype=int)

        self.calibrator.fit(logits, targets)
        self.is_fitted = True
        return self

    def predict_proba(self, y_prob: list[float] | np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise RuntimeError("ProbabilityCalibrator must be fitted before predict_proba.")

        probs = np.array(y_prob, dtype=float).clip(1e-6, 1.0 - 1e-6)
        logits = np.log(probs / (1.0 - probs)).reshape(-1, 1)
        return self.calibrator.predict_proba(logits)[:, 1]
