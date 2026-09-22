"""
Spatial statistical analysis including density grids, clustering metrics,
and spatial autocorrelation (Moran's I approximation).
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Tuple
import numpy as np
from .distance import haversine_distance


def calculate_spatial_density_grid(
    points: List[Tuple[float, float]],
    grid_size: int = 10,
) -> Dict[str, Any]:
    """Calculates 2D histogram density of incident/hazard points."""
    if not points:
        return {"grid": [], "bounds": {}, "max_density": 0}

    lats = [p[0] for p in points]
    lons = [p[1] for p in points]

    min_lat, max_lat = min(lats), max(lats)
    min_lon, max_lon = min(lons), max(lons)

    # Add small padding if all points are identical
    if min_lat == max_lat:
        min_lat -= 0.01
        max_lat += 0.01
    if min_lon == max_lon:
        min_lon -= 0.01
        max_lon += 0.01

    lat_bins = np.linspace(min_lat, max_lat, grid_size + 1)
    lon_bins = np.linspace(min_lon, max_lon, grid_size + 1)

    hist, _, _ = np.histogram2d(lats, lons, bins=[lat_bins, lon_bins])

    cells = []
    max_d = 0
    for r in range(grid_size):
        for c in range(grid_size):
            count = int(hist[r, c])
            if count > max_d:
                max_d = count
            cells.append({
                "cell_id": f"{r}_{c}",
                "center_lat": round(float((lat_bins[r] + lat_bins[r + 1]) / 2.0), 4),
                "center_lon": round(float((lon_bins[c] + lon_bins[c + 1]) / 2.0), 4),
                "count": count,
            })

    return {
        "grid": cells,
        "bounds": {
            "min_lat": round(min_lat, 4),
            "max_lat": round(max_lat, 4),
            "min_lon": round(min_lon, 4),
            "max_lon": round(max_lon, 4),
        },
        "max_density": max_d,
        "total_points": len(points),
    }


def calculate_morans_i(
    locations: List[Tuple[float, float]],
    values: List[float],
) -> Dict[str, Any]:
    """
    Computes Moran's I measure of spatial autocorrelation for continuous disaster variables.
    Values close to +1 indicate clustering; near -1 indicate dispersion; near 0 indicate randomness.
    """
    n = len(values)
    if n < 4:
        return {"morans_i": 0.0, "status": "insufficient_data", "pattern": "random"}

    y = np.array(values, dtype=float)
    y_mean = np.mean(y)
    z = y - y_mean
    ss = np.sum(z ** 2)

    if ss < 1e-9:
        return {"morans_i": 0.0, "status": "zero_variance", "pattern": "uniform"}

    # Compute inverse distance spatial weights matrix
    w = np.zeros((n, n), dtype=float)
    for i in range(n):
        for j in range(n):
            if i != j:
                d = haversine_distance(locations[i][0], locations[i][1], locations[j][0], locations[j][1])
                w[i, j] = 1.0 / (d + 0.1)

    s0 = np.sum(w)
    if s0 < 1e-9:
        return {"morans_i": 0.0, "status": "zero_weights", "pattern": "isolated"}

    num = 0.0
    for i in range(n):
        for j in range(n):
            num += w[i, j] * z[i] * z[j]

    morans_i = float((n / s0) * (num / ss))

    pattern = "clustered" if morans_i > 0.25 else "dispersed" if morans_i < -0.25 else "random"

    return {
        "morans_i": round(morans_i, 4),
        "pattern": pattern,
        "sample_size": n,
        "status": "computed",
    }
