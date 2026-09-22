"""
Geographic zone management, polygon point-in-polygon containment, and buffer generation.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from .distance import haversine_distance


@dataclass
class HazardZone:
    zone_id: str
    name: str
    hazard_type: str
    severity: str
    polygon: List[Tuple[float, float]]  # List of (latitude, longitude)
    center_lat: float
    center_lon: float
    radius_km: float = 5.0
    population: int = 0
    properties: Dict[str, Any] = field(default_factory=dict)

    def contains_point(self, lat: float, lon: float) -> bool:
        """Ray-casting algorithm for point-in-polygon test."""
        if not self.polygon:
            # Fall back to radial distance
            return haversine_distance(self.center_lat, self.center_lon, lat, lon) <= self.radius_km

        n = len(self.polygon)
        inside = False
        p1_lat, p1_lon = self.polygon[0]
        for i in range(1, n + 1):
            p2_lat, p2_lon = self.polygon[i % n]
            if lon > min(p1_lon, p2_lon):
                if lon <= max(p1_lon, p2_lon):
                    if lat <= max(p1_lat, p2_lat):
                        if p1_lon != p2_lon:
                            lat_inters = (lon - p1_lon) * (p2_lat - p1_lat) / (p2_lon - p1_lon) + p1_lat
                        if p1_lat == p2_lat or lat <= lat_inters:
                            inside = not inside
            p1_lat, p1_lon = p2_lat, p2_lon
        return inside

    def to_dict(self) -> Dict[str, Any]:
        return {
            "zone_id": self.zone_id,
            "name": self.name,
            "hazard_type": self.hazard_type,
            "severity": self.severity,
            "center": {"latitude": self.center_lat, "longitude": self.center_lon},
            "radius_km": self.radius_km,
            "polygon": [{"latitude": p[0], "longitude": p[1]} for p in self.polygon],
            "population": self.population,
            "properties": self.properties,
        }


def create_circular_zone(
    zone_id: str,
    name: str,
    hazard_type: str,
    severity: str,
    center_lat: float,
    center_lon: float,
    radius_km: float,
    points_count: int = 16,
) -> HazardZone:
    """Approximate circular buffer zone as a polygon."""
    polygon = []
    earth_r = 6371.0
    for i in range(points_count):
        angle = 2.0 * math.pi * i / points_count
        d_lat = math.degrees((radius_km / earth_r) * math.cos(angle))
        cos_center = math.cos(math.radians(center_lat))
        d_lon = math.degrees((radius_km / (earth_r * cos_center)) * math.sin(angle)) if abs(cos_center) > 1e-6 else 0.0
        polygon.append((center_lat + d_lat, center_lon + d_lon))

    return HazardZone(
        zone_id=zone_id,
        name=name,
        hazard_type=hazard_type,
        severity=severity,
        polygon=polygon,
        center_lat=center_lat,
        center_lon=center_lon,
        radius_km=radius_km,
    )


def classify_point_zones(
    lat: float,
    lon: float,
    zones: List[HazardZone],
) -> List[HazardZone]:
    """Return all zones containing the given point."""
    return [z for z in zones if z.contains_point(lat, lon)]
