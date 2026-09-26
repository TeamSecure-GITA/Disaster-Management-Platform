"""Spatial feature extraction and distance calculations."""
from __future__ import annotations
import numpy as np
import pandas as pd

class SpatialFeatureExtractor:
    """Calculates distance to faults, rivers, coastline, and spatial coordinates."""
    def extract_spatial_coordinates(self, lats: np.ndarray, lons: np.ndarray) -> pd.DataFrame:
        lat_rad = np.radians(lats)
        lon_rad = np.radians(lons)
        return pd.DataFrame({
            "x": np.cos(lat_rad) * np.cos(lon_rad),
            "y": np.cos(lat_rad) * np.sin(lon_rad),
            "z": np.sin(lat_rad)
        })
