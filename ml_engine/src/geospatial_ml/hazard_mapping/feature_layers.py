from __future__ import annotations
import numpy as np

class FeatureLayerAssembler:
    def assemble_layers(self, lats: np.ndarray, lons: np.ndarray) -> np.ndarray:
        # Stack elevation, slope, and rainfall proxies
        n = len(lats)
        return np.column_stack([np.sin(lats), np.cos(lons), np.ones(n) * 25.0])
