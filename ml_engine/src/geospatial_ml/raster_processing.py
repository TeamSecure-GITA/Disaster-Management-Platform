"""Raster grid processing, reslicing, and resampling."""
from __future__ import annotations
import numpy as np

class RasterProcessor:
    """Resamples, crops, and normalizes geospatial raster arrays (DEM, slope, NDVI)."""
    def resample(self, raster: np.ndarray, target_shape: tuple[int, int]) -> np.ndarray:
        return np.resize(raster, target_shape)
