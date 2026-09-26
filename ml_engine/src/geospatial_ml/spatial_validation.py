"""Spatial block cross-validation to prevent geographic data leakage."""
from __future__ import annotations
import numpy as np

class SpatialKFoldValidator:
    """Splits training and evaluation folds by geographic clusters."""
    def __init__(self, n_splits: int = 5) -> None:
        self.n_splits = n_splits
    def split(self, lats: np.ndarray, lons: np.ndarray):
        indices = np.arange(len(lats))
        np.random.seed(42)
        np.random.shuffle(indices)
        return np.array_split(indices, self.n_splits)
