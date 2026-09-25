from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class SpatialFeatureExtractor(BaseFeatureExtractor):
    """Extracts geospatial geometry, cartesian projections, and proximity features."""

    def __init__(
        self,
        lat_col: str = "latitude",
        lon_col: str = "longitude",
        reference_points: dict[str, tuple[float, float]] | None = None,
    ) -> None:
        self.lat_col = lat_col
        self.lon_col = lon_col
        self.reference_points = reference_points or {
            "origin": (0.0, 0.0),
        }

    @staticmethod
    def haversine_distance(
        lat1: pd.Series | np.ndarray,
        lon1: pd.Series | np.ndarray,
        lat2: float,
        lon2: float,
    ) -> np.ndarray:
        """Compute haversine distance in kilometers."""
        r = 6371.0  # Earth radius in km
        phi1 = np.radians(lat1)
        phi2 = np.radians(lat2)
        delta_phi = np.radians(lat2 - lat1)
        delta_lambda = np.radians(lon2 - lon1)

        a = (
            np.sin(delta_phi / 2.0) ** 2
            + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0) ** 2
        )
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return r * c

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        if self.lat_col not in df.columns or self.lon_col not in df.columns:
            return df

        lat = pd.to_numeric(df[self.lat_col], errors="coerce").fillna(0.0)
        lon = pd.to_numeric(df[self.lon_col], errors="coerce").fillna(0.0)

        # 3D Cartesian coordinates on sphere
        rad_lat = np.radians(lat)
        rad_lon = np.radians(lon)
        df["geo_x"] = np.cos(rad_lat) * np.cos(rad_lon)
        df["geo_y"] = np.cos(rad_lat) * np.sin(rad_lon)
        df["geo_z"] = np.sin(rad_lat)

        # Proximity distances to key references
        for name, (ref_lat, ref_lon) in self.reference_points.items():
            df[f"dist_to_{name}_km"] = self.haversine_distance(lat, lon, ref_lat, ref_lon)

        return df
