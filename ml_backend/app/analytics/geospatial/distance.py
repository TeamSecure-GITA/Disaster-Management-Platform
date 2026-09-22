"""
Geospatial distance and proximity algorithms for emergency response.
Provides Haversine formulas, bearing calculations, and nearest neighbor search.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

EARTH_RADIUS_KM = 6371.0


def haversine_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate great-circle distance between two points in kilometers."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c


def calculate_bearing(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Calculate compass initial bearing from point 1 to point 2 in degrees (0-360)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    initial_bearing = math.atan2(y, x)
    return (math.degrees(initial_bearing) + 360.0) % 360.0


def bounding_box(
    latitude: float,
    longitude: float,
    radius_km: float,
) -> Tuple[float, float, float, float]:
    """
    Returns (min_lat, min_lon, max_lat, max_lon) for a search radius in km.
    """
    delta_lat = math.degrees(radius_km / EARTH_RADIUS_KM)
    cos_lat = math.cos(math.radians(latitude))
    delta_lon = math.degrees(radius_km / (EARTH_RADIUS_KM * cos_lat)) if abs(cos_lat) > 1e-6 else 180.0

    return (
        latitude - delta_lat,
        longitude - delta_lon,
        latitude + delta_lat,
        longitude + delta_lon,
    )


def find_nearest_entities(
    origin_lat: float,
    origin_lon: float,
    entities: List[Dict[str, Any]],
    lat_key: str = "latitude",
    lon_key: str = "longitude",
    max_count: int = 5,
    max_radius_km: Optional[float] = None,
) -> List[Dict[str, Any]]:
    """Sort entities by distance to origin point and annotate with distance_km."""
    scored = []
    for e in entities:
        lat = e.get(lat_key)
        lon = e.get(lon_key)
        if lat is None or lon is None:
            continue
        dist = haversine_distance(origin_lat, origin_lon, float(lat), float(lon))
        if max_radius_km is not None and dist > max_radius_km:
            continue
        item = dict(e)
        item["distance_km"] = round(dist, 3)
        item["bearing_deg"] = round(calculate_bearing(origin_lat, origin_lon, float(lat), float(lon)), 1)
        scored.append(item)

    scored.sort(key=lambda x: x["distance_km"])
    return scored[:max_count]
