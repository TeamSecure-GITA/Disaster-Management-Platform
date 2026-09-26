"""Flood color and NDWI visual features."""
from __future__ import annotations
import numpy as np

class FloodVisualFeatures:
    def compute_water_index_proxy(self, rgb_image: np.ndarray) -> float:
        # Green minus Red / Green plus Red
        g = rgb_image[:, :, 1].astype(float)
        r = rgb_image[:, :, 0].astype(float)
        ndwi = (g - r) / (g + r + 1e-5)
        return float(np.mean(ndwi))
