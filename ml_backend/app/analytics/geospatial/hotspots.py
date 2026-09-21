"""
Geospatial hotspot detection and spatial intensity analysis.

Identifies high-density incident epicenters, cascading risk zones, and spatial clusters
using spatial kernel density estimation and local intensity scoring.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Tuple


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    earth_radius_km = 6371.0088

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return earth_radius_km * c


@dataclass
class GeoPoint:
    """A weighted geographical point."""

    id: str
    latitude: float
    longitude: float
    weight: float = 1.0  # severity or count weight
    category: str = "general"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class HotspotZone:
    """An identified geospatial high-intensity hotspot."""

    id: str
    center_latitude: float
    center_longitude: float
    radius_km: float
    intensity_score: float
    z_score: float
    confidence_level: str  # 90%, 95%, 99%
    incident_count: int
    total_weight: float
    top_categories: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "center_latitude": round(self.center_latitude, 6),
            "center_longitude": round(self.center_longitude, 6),
            "radius_km": round(self.radius_km, 2),
            "intensity_score": round(self.intensity_score, 4),
            "z_score": round(self.z_score, 2),
            "confidence_level": self.confidence_level,
            "incident_count": self.incident_count,
            "total_weight": round(self.total_weight, 2),
            "top_categories": self.top_categories,
        }


class HotspotAnalyzer:
    """
    Computes spatial density fields and statistical hotspot zones (Gi*-like analysis).
    """

    def __init__(self, default_bandwidth_km: float = 5.0):
        self.default_bandwidth_km = default_bandwidth_km

    def compute_kernel_density(
        self,
        target_lat: float,
        target_lon: float,
        points: Sequence[GeoPoint],
        bandwidth_km: Optional[float] = None,
    ) -> float:
        """
        Quartic (biweight) kernel density estimate at a specific coordinate.
        """
        h = bandwidth_km or self.default_bandwidth_km
        if h <= 0 or not points:
            return 0.0

        density = 0.0
        for pt in points:
            d = haversine_distance_km(target_lat, target_lon, pt.latitude, pt.longitude)
            if d < h:
                # Quartic kernel: (15/16) * (1 - (d/h)^2)^2
                u = d / h
                k = (15.0 / 16.0) * ((1.0 - (u * u)) ** 2)
                density += pt.weight * k / (math.pi * (h ** 2))

        return density

    def identify_hotspots(
        self,
        points: Sequence[GeoPoint],
        bandwidth_km: Optional[float] = None,
        min_incidents: int = 3,
        significance_z_threshold: float = 1.96,
    ) -> List[HotspotZone]:
        """
        Detect significant cluster centers using localized neighborhood intensity testing.
        """
        if len(points) < min_incidents:
            return []

        h = bandwidth_km or self.default_bandwidth_km
        n = len(points)
        weights = [p.weight for p in points]
        mean_w = sum(weights) / n
        s_squared = sum((w - mean_w) ** 2 for w in weights) / n
        s_dev = math.sqrt(s_squared) if s_squared > 0 else 1.0

        candidates: List[Tuple[GeoPoint, float, float, List[GeoPoint]]] = []

        for p in points:
            neighbors: List[GeoPoint] = []
            sum_w = 0.0

            for other in points:
                dist = haversine_distance_km(p.latitude, p.longitude, other.latitude, other.longitude)
                if dist <= h:
                    neighbors.append(other)
                    sum_w += other.weight

            n_neighbors = len(neighbors)
            if n_neighbors < min_incidents:
                continue

            # Standardized local spatial score
            numerator = sum_w - (n_neighbors * mean_w)
            denom_factor = ((n * n_neighbors) - (n_neighbors ** 2)) / (n - 1.0) if n > 1 else 1.0
            denom = s_dev * math.sqrt(max(denom_factor, 1e-6))
            z_score = numerator / denom if denom > 0 else 0.0

            if z_score >= significance_z_threshold:
                intensity = sum_w / (math.pi * (h ** 2))
                candidates.append((p, z_score, intensity, neighbors))

        # Sort descending by z_score and suppress duplicate overlapping hotspots
        candidates.sort(key=lambda x: x[1], reverse=True)
        selected_hotspots: List[HotspotZone] = []

        for p, z, intensity, neighbors in candidates:
            # Check overlap with already selected
            overlap = False
            for s in selected_hotspots:
                dist = haversine_distance_km(p.latitude, p.longitude, s.center_latitude, s.center_longitude)
                if dist < h * 0.75:
                    overlap = True
                    break

            if overlap:
                continue

            # Confidence level based on standard normal distribution
            if z >= 2.58:
                conf = "99%"
            elif z >= 1.96:
                conf = "95%"
            else:
                conf = "90%"

            # Categories represented in this hotspot
            cat_counts: Dict[str, int] = {}
            for nb in neighbors:
                cat_counts[nb.category] = cat_counts.get(nb.category, 0) + 1
            top_cats = sorted(cat_counts.keys(), key=lambda c: cat_counts[c], reverse=True)[:3]

            hotspot_id = f"hotspot-{len(selected_hotspots) + 1}"
            selected_hotspots.append(
                HotspotZone(
                    id=hotspot_id,
                    center_latitude=p.latitude,
                    center_longitude=p.longitude,
                    radius_km=h,
                    intensity_score=intensity,
                    z_score=z,
                    confidence_level=conf,
                    incident_count=len(neighbors),
                    total_weight=sum(nb.weight for nb in neighbors),
                    top_categories=top_cats,
                )
            )

        return selected_hotspots
