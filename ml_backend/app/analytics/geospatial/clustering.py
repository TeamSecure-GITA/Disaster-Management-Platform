"""
Spatial clustering for emergency incident dispatch and resource grouping.

Implements density-based spatial clustering (DBSCAN with haversine distance metric)
without external C-extension or scikit-learn requirements.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Set

from .hotspots import haversine_distance_km


@dataclass
class SpatialPoint:
    """A spatial observation with optional dispatch weight and attributes."""

    id: str
    latitude: float
    longitude: float
    weight: float = 1.0
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SpatialCluster:
    """A group of spatially contiguous emergency points."""

    cluster_id: int
    points_count: int
    centroid_latitude: float
    centroid_longitude: float
    bounding_box: Dict[str, float]  # min_lat, max_lat, min_lon, max_lon
    total_weight: float
    point_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "cluster_id": self.cluster_id,
            "points_count": self.points_count,
            "centroid_latitude": round(self.centroid_latitude, 6),
            "centroid_longitude": round(self.centroid_longitude, 6),
            "bounding_box": {k: round(v, 6) for k, v in self.bounding_box.items()},
            "total_weight": round(self.total_weight, 2),
            "point_ids": self.point_ids,
        }


@dataclass
class ClusteringResult:
    """Consolidated output of spatial clustering."""

    num_clusters: int
    num_clustered_points: int
    num_noise_points: int
    clusters: List[SpatialCluster] = field(default_factory=list)
    noise_point_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "num_clusters": self.num_clusters,
            "num_clustered_points": self.num_clustered_points,
            "num_noise_points": self.num_noise_points,
            "clusters": [c.to_dict() for c in self.clusters],
            "noise_point_ids": self.noise_point_ids,
        }


class SpatialClusterer:
    """
    Groups distributed incidents or emergency requests into operational sectors.
    """

    def __init__(self, eps_km: float = 3.0, min_samples: int = 2):
        self.eps_km = eps_km
        self.min_samples = min_samples

    def fit(
        self,
        points: Sequence[SpatialPoint],
        eps_km: Optional[float] = None,
        min_samples: Optional[int] = None,
    ) -> ClusteringResult:
        """
        Execute DBSCAN clustering over latitude/longitude coordinates using spherical distance.
        """
        eps = eps_km if eps_km is not None else self.eps_km
        min_pts = min_samples if min_samples is not None else self.min_samples
        pts = list(points)
        n = len(pts)

        if n == 0:
            return ClusteringResult(0, 0, 0, [], [])

        # Label: None = unvisited, -1 = noise, >= 0 = cluster_id
        labels: Dict[int, Optional[int]] = {i: None for i in range(n)}
        cluster_id = 0

        # Precompute neighbors
        def region_query(p_idx: int) -> List[int]:
            p1 = pts[p_idx]
            neighbors = []
            for j in range(n):
                d = haversine_distance_km(p1.latitude, p1.longitude, pts[j].latitude, pts[j].longitude)
                if d <= eps:
                    neighbors.append(j)
            return neighbors

        for i in range(n):
            if labels[i] is not None:
                continue

            neighbors = region_query(i)
            if len(neighbors) < min_pts:
                labels[i] = -1  # Mark as noise
            else:
                labels[i] = cluster_id
                queue = [idx for idx in neighbors if idx != i]
                queue_set = set(queue)

                while queue:
                    curr = queue.pop(0)
                    queue_set.discard(curr)

                    if labels[curr] == -1:
                        labels[curr] = cluster_id  # Border point reassigned

                    if labels[curr] is not None:
                        continue

                    labels[curr] = cluster_id
                    curr_neighbors = region_query(curr)
                    if len(curr_neighbors) >= min_pts:
                        for nb in curr_neighbors:
                            if labels[nb] is None and nb not in queue_set:
                                queue.append(nb)
                                queue_set.add(nb)

                cluster_id += 1

        # Build clusters
        cluster_groups: Dict[int, List[SpatialPoint]] = {}
        noise_ids: List[str] = []

        for i, cid in labels.items():
            if cid == -1 or cid is None:
                noise_ids.append(pts[i].id)
            else:
                if cid not in cluster_groups:
                    cluster_groups[cid] = []
                cluster_groups[cid].append(pts[i])

        clusters_out: List[SpatialCluster] = []
        for cid, group in sorted(cluster_groups.items()):
            lats = [p.latitude for p in group]
            lons = [p.longitude for p in group]
            total_w = sum(p.weight for p in group)

            # Centroid weighted by point weight
            if total_w > 0:
                c_lat = sum(p.latitude * p.weight for p in group) / total_w
                c_lon = sum(p.longitude * p.weight for p in group) / total_w
            else:
                c_lat = sum(lats) / len(group)
                c_lon = sum(lons) / len(group)

            bbox = {
                "min_lat": min(lats),
                "max_lat": max(lats),
                "min_lon": min(lons),
                "max_lon": max(lons),
            }

            clusters_out.append(
                SpatialCluster(
                    cluster_id=cid,
                    points_count=len(group),
                    centroid_latitude=c_lat,
                    centroid_longitude=c_lon,
                    bounding_box=bbox,
                    total_weight=total_w,
                    point_ids=[p.id for p in group],
                )
            )

        return ClusteringResult(
            num_clusters=len(clusters_out),
            num_clustered_points=n - len(noise_ids),
            num_noise_points=len(noise_ids),
            clusters=clusters_out,
            noise_point_ids=noise_ids,
        )
