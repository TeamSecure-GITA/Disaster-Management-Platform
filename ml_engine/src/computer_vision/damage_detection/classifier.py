"""Damage severity classifier (No Damage, Minor, Major, Destroyed)."""
from __future__ import annotations
import numpy as np

class DamageClassifier:
    def classify(self, feature_vector: np.ndarray) -> str:
        val = np.mean(feature_vector)
        if val > 0.75:
            return "DESTROYED"
        elif val > 0.5:
            return "MAJOR"
        elif val > 0.25:
            return "MINOR"
        return "NO_DAMAGE"
