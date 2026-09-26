from __future__ import annotations
import numpy as np
from sklearn.linear_model import LogisticRegression

class StackingEnsemble:
    def __init__(self) -> None:
        self.meta_model = LogisticRegression()
        self.is_fitted = False

    def fit(self, base_predictions: np.ndarray, y: np.ndarray) -> StackingEnsemble:
        self.meta_model.fit(base_predictions, y)
        self.is_fitted = True
        return self

    def predict_proba(self, base_predictions: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            return np.mean(base_predictions, axis=1)
        return self.meta_model.predict_proba(base_predictions)[:, 1]
