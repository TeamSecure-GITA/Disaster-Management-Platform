from __future__ import annotations
import numpy as np

class WeightedEnsemble:
    def __init__(self, weights: list[float] | None = None) -> None:
        self.weights = weights

    def predict(self, predictions: list[np.ndarray]) -> np.ndarray:
        preds = np.array(predictions)
        if self.weights is None:
            w = np.ones(len(preds)) / len(preds)
        else:
            w = np.array(self.weights) / np.sum(self.weights)
        return np.tensordot(w, preds, axes=(0, 0))
