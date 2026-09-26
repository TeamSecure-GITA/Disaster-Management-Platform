"""Coordinate transformation and distance utilities."""
from __future__ import annotations
import numpy as np

class CoordinateTransformer:
    """Converts between WGS84 (EPSG:4326) and projected systems (e.g. UTM/Web Mercator)."""
    def haversine_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        r = 6371.0
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat / 2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return float(r * c)
