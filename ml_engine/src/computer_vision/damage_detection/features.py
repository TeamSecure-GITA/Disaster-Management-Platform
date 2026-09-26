"""Damage visual feature extraction."""
from __future__ import annotations
import numpy as np

class DamageFeatureExtractor:
    def extract_features(self, image: np.ndarray) -> np.ndarray:
        return np.mean(image, axis=(0, 1))
