"""
Feature store sub-package.

Provides a unified ``FeatureStoreService`` facade over the in-memory store,
the feature registry, and the version manager.
"""

from __future__ import annotations

from .registry import (
    FeatureDataType,
    FeatureDefinition,
    FeatureRegistry,
    FeatureStatus,
    build_default_registry,
)
from .store import (
    FeatureLookupResult,
    FeatureStore,
    FeatureVector,
)
from .versions import (
    FeatureSnapshot,
    FeatureVersionManager,
    VersionDiff,
)


class FeatureStoreService:
    """
    Unified entry-point for all feature store operations.

    Example::

        svc = FeatureStoreService()

        # Write features
        svc.store.put(FeatureVector(
            entity_id="sensor-WL-001",
            feature_group="sensor",
            version="v1",
            features={"water_level_m": 6.8, "trend": "rising"},
            ttl_seconds=600,
        ))

        # Retrieve latest
        result = svc.store.get("sensor-WL-001", "sensor")

        # Version history
        snap = svc.versions.commit("sensor-WL-001", "sensor", result.features)
    """

    def __init__(
        self,
        store: FeatureStore | None = None,
        registry: FeatureRegistry | None = None,
        version_manager: FeatureVersionManager | None = None,
    ):
        self.store: FeatureStore = store or FeatureStore()
        self.registry: FeatureRegistry = registry or build_default_registry()
        self.versions: FeatureVersionManager = version_manager or FeatureVersionManager()

    def health(self) -> dict:
        return {
            "service": "feature_store",
            "status": "ok",
            "store_stats": self.store.stats(),
            "registry_total_features": self.registry.total_features(),
        }


__all__ = [
    "FeatureStoreService",
    # Store
    "FeatureStore",
    "FeatureVector",
    "FeatureLookupResult",
    # Registry
    "FeatureRegistry",
    "FeatureDefinition",
    "FeatureDataType",
    "FeatureStatus",
    "build_default_registry",
    # Versions
    "FeatureVersionManager",
    "FeatureSnapshot",
    "VersionDiff",
]
