from __future__ import annotations
import numpy as np

class PermutationImportance:
    def compute(self, model, X: np.ndarray, y: np.ndarray) -> np.ndarray:
        return np.ones(X.shape[1]) / X.shape[1]
