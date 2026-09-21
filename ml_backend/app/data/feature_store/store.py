"""
Feature store — central in-memory feature registry.

Persists engineered feature vectors keyed by (entity_id, feature_group, version)
tuples. Supports point-in-time lookups, feature group retrieval, and TTL-based
expiry for streaming feature freshness guarantees.

In production this would be backed by Redis / Feast / Tecton; this
implementation provides an identical API using in-process dictionaries,
making it drop-in replaceable without API changes.
"""

from __future__ import annotations

import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class FeatureVector:
    """
    A named, versioned feature vector for one entity.

    ``features`` is a flat dict of feature_name -> numeric or categorical value.
    ``entity_id`` uniquely identifies the subject (e.g. "sensor-WL-001",
    "region-assam", "incident-flood-2026-001").
    """

    entity_id: str
    feature_group: str          # e.g. "weather_features", "sensor_features"
    version: str                # e.g. "v1", "2026-09-21"
    features: Dict[str, Any]
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    ttl_seconds: Optional[float] = None   # None = no expiry
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @property
    def key(self) -> Tuple[str, str, str]:
        return (self.entity_id, self.feature_group, self.version)


@dataclass
class FeatureLookupResult:
    """Result of a feature retrieval operation."""

    found: bool
    entity_id: str
    feature_group: str
    version: str
    features: Dict[str, Any]
    created_at: Optional[str] = None
    expired: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FeatureStore:
    """
    In-memory feature store with TTL expiry and version support.

    Thread-safety: This implementation uses plain dicts. For production use
    behind an ASGI server, back with Redis or another thread-safe store.

    Example::

        store = FeatureStore()

        store.put(FeatureVector(
            entity_id="sensor-WL-001",
            feature_group="water_level_features",
            version="v1",
            features={"level_m": 6.2, "level_z_score": 2.1, "trend": "rising"},
            ttl_seconds=300.0,
        ))

        result = store.get("sensor-WL-001", "water_level_features")
    """

    def __init__(self, max_size: int = 100_000):
        self.max_size = max_size
        self._store: Dict[Tuple[str, str, str], FeatureVector] = {}
        self._insert_times: Dict[Tuple[str, str, str], float] = {}

    # ------------------------------------------------------------------
    # Write operations
    # ------------------------------------------------------------------

    def put(self, vector: FeatureVector) -> None:
        """Store a feature vector. Evicts expired entries when nearing capacity."""
        if len(self._store) >= self.max_size:
            self._evict_expired()

        self._store[vector.key] = vector
        self._insert_times[vector.key] = time.monotonic()

    def put_batch(self, vectors: List[FeatureVector]) -> None:
        for v in vectors:
            self.put(v)

    def update_features(
        self,
        entity_id: str,
        feature_group: str,
        version: str,
        updates: Dict[str, Any],
    ) -> bool:
        """
        Merge ``updates`` into an existing feature vector.
        Returns False if the vector does not exist.
        """
        key = (entity_id, feature_group, version)
        vec = self._store.get(key)
        if vec is None:
            return False
        if self._is_expired(key):
            self._delete_key(key)
            return False
        vec.features.update(updates)
        return True

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    def get(
        self,
        entity_id: str,
        feature_group: str,
        version: str = "latest",
    ) -> FeatureLookupResult:
        """
        Retrieve a feature vector by entity + group + version.

        If ``version="latest"`` (default), returns the most recently stored
        vector for the entity/group regardless of version tag.
        """
        if version == "latest":
            return self._get_latest(entity_id, feature_group)

        key = (entity_id, feature_group, version)
        vec = self._store.get(key)

        if vec is None:
            return FeatureLookupResult(
                found=False,
                entity_id=entity_id,
                feature_group=feature_group,
                version=version,
                features={},
            )

        if self._is_expired(key):
            self._delete_key(key)
            return FeatureLookupResult(
                found=False,
                entity_id=entity_id,
                feature_group=feature_group,
                version=version,
                features={},
                expired=True,
            )

        return FeatureLookupResult(
            found=True,
            entity_id=entity_id,
            feature_group=feature_group,
            version=version,
            features=dict(vec.features),
            created_at=vec.created_at,
        )

    def get_batch(
        self,
        lookups: List[Tuple[str, str]],
        version: str = "latest",
    ) -> List[FeatureLookupResult]:
        """
        Batch retrieval.  ``lookups`` is a list of (entity_id, feature_group) tuples.
        """
        return [
            self.get(eid, fg, version=version)
            for eid, fg in lookups
        ]

    def list_entity_groups(self, entity_id: str) -> List[str]:
        """Return all feature groups stored for an entity."""
        groups = {
            fg for eid, fg, _ in self._store
            if eid == entity_id and not self._is_expired((eid, fg, _))
        }
        return sorted(groups)

    def list_all_entities(self) -> List[str]:
        return sorted({eid for eid, _, _ in self._store})

    # ------------------------------------------------------------------
    # Maintenance
    # ------------------------------------------------------------------

    def delete(self, entity_id: str, feature_group: str, version: str) -> bool:
        key = (entity_id, feature_group, version)
        return self._delete_key(key)

    def _evict_expired(self) -> int:
        expired_keys = [k for k in list(self._store) if self._is_expired(k)]
        for k in expired_keys:
            self._delete_key(k)
        return len(expired_keys)

    def evict_expired(self) -> int:
        """Public trigger for TTL eviction. Returns evicted count."""
        return self._evict_expired()

    def stats(self) -> Dict[str, Any]:
        total = len(self._store)
        expired = sum(1 for k in self._store if self._is_expired(k))
        return {
            "total_vectors": total,
            "live_vectors": total - expired,
            "expired_vectors": expired,
            "max_size": self.max_size,
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _get_latest(self, entity_id: str, feature_group: str) -> FeatureLookupResult:
        candidates = [
            (k, v)
            for (eid, fg, _), v in self._store.items()
            for k in [(eid, fg, _)]
            if eid == entity_id and fg == feature_group and not self._is_expired(k)
        ]
        if not candidates:
            return FeatureLookupResult(
                found=False,
                entity_id=entity_id,
                feature_group=feature_group,
                version="latest",
                features={},
            )
        # Return the most recently inserted
        candidates.sort(key=lambda x: self._insert_times.get(x[0], 0), reverse=True)
        _, vec = candidates[0]
        return FeatureLookupResult(
            found=True,
            entity_id=entity_id,
            feature_group=feature_group,
            version=vec.version,
            features=dict(vec.features),
            created_at=vec.created_at,
        )

    def _is_expired(self, key: Tuple[str, str, str]) -> bool:
        vec = self._store.get(key)
        if vec is None or vec.ttl_seconds is None:
            return False
        insert_time = self._insert_times.get(key, 0.0)
        return (time.monotonic() - insert_time) >= vec.ttl_seconds

    def _delete_key(self, key: Tuple[str, str, str]) -> bool:
        existed = key in self._store
        self._store.pop(key, None)
        self._insert_times.pop(key, None)
        return existed
