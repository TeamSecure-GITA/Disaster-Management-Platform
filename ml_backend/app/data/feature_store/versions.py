"""
Feature versioning.

Tracks the history of feature vector snapshots over time, enabling:
- Point-in-time feature retrieval for reproducible model training
- Drift detection (comparing feature distributions across versions)
- Rollback to earlier feature computation results
- Audit trails for compliance and post-incident review

Each stored snapshot is immutable once written (append-only design).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class FeatureSnapshot:
    """
    An immutable, timestamped snapshot of a feature vector for one entity.

    Snapshots are write-once. To update features, write a new snapshot
    with a higher version number or a new timestamp.
    """

    snapshot_id: str
    entity_id: str
    feature_group: str
    version: int                         # Monotonically increasing integer version
    features: Dict[str, Any]
    pipeline_run_id: Optional[str] = None    # Links back to the pipeline run
    data_quality_score: Optional[float] = None
    source_record_ids: List[str] = field(default_factory=list)
    snapshot_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @property
    def version_tag(self) -> str:
        return f"v{self.version}"


@dataclass
class VersionDiff:
    """Diff between two consecutive feature snapshots."""

    entity_id: str
    feature_group: str
    from_version: int
    to_version: int
    added_features: List[str]
    removed_features: List[str]
    changed_features: Dict[str, Dict[str, Any]]   # feature_name -> {"from": ..., "to": ...}
    diff_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @property
    def has_changes(self) -> bool:
        return bool(self.added_features or self.removed_features or self.changed_features)


class FeatureVersionManager:
    """
    Manage immutable feature snapshot history with point-in-time retrieval.

    Example::

        manager = FeatureVersionManager()

        snap1 = manager.commit(
            entity_id="region-assam",
            feature_group="weather",
            features={"rainfall_mm_24h": 45.2, "wind_speed_ms": 8.1},
            pipeline_run_id="run-001",
        )

        snap2 = manager.commit(
            entity_id="region-assam",
            feature_group="weather",
            features={"rainfall_mm_24h": 92.4, "wind_speed_ms": 12.5},
            pipeline_run_id="run-002",
        )

        diff = manager.diff(snap1.snapshot_id, snap2.snapshot_id)
    """

    def __init__(self):
        # snapshot_id -> FeatureSnapshot
        self._snapshots: Dict[str, FeatureSnapshot] = {}

        # (entity_id, feature_group) -> sorted list of (version, snapshot_id)
        self._version_index: Dict[str, List[tuple[int, str]]] = {}

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    def commit(
        self,
        entity_id: str,
        feature_group: str,
        features: Dict[str, Any],
        pipeline_run_id: Optional[str] = None,
        data_quality_score: Optional[float] = None,
        source_record_ids: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
    ) -> FeatureSnapshot:
        """
        Commit a new feature snapshot. Auto-increments version number.
        Returns the created snapshot.
        """
        import uuid

        index_key = f"{entity_id}::{feature_group}"
        existing = self._version_index.get(index_key, [])
        next_version = (max(v for v, _ in existing) + 1) if existing else 1

        snapshot_id = f"snap-{uuid.uuid4().hex[:10]}"

        snapshot = FeatureSnapshot(
            snapshot_id=snapshot_id,
            entity_id=entity_id,
            feature_group=feature_group,
            version=next_version,
            features=dict(features),
            pipeline_run_id=pipeline_run_id,
            data_quality_score=data_quality_score,
            source_record_ids=source_record_ids or [],
            tags=tags or [],
        )

        self._snapshots[snapshot_id] = snapshot
        existing.append((next_version, snapshot_id))
        self._version_index[index_key] = sorted(existing)

        return snapshot

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    def get_snapshot(self, snapshot_id: str) -> Optional[FeatureSnapshot]:
        return self._snapshots.get(snapshot_id)

    def get_version(
        self,
        entity_id: str,
        feature_group: str,
        version: int,
    ) -> Optional[FeatureSnapshot]:
        index_key = f"{entity_id}::{feature_group}"
        for v, sid in self._version_index.get(index_key, []):
            if v == version:
                return self._snapshots.get(sid)
        return None

    def get_latest(
        self,
        entity_id: str,
        feature_group: str,
    ) -> Optional[FeatureSnapshot]:
        index_key = f"{entity_id}::{feature_group}"
        versions = self._version_index.get(index_key, [])
        if not versions:
            return None
        _, latest_sid = versions[-1]
        return self._snapshots.get(latest_sid)

    def get_at_or_before(
        self,
        entity_id: str,
        feature_group: str,
        timestamp: str,
    ) -> Optional[FeatureSnapshot]:
        """
        Point-in-time retrieval: return the latest snapshot that was committed
        at or before the given ISO-8601 timestamp.
        """
        index_key = f"{entity_id}::{feature_group}"
        versions = self._version_index.get(index_key, [])
        target_ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

        candidate: Optional[FeatureSnapshot] = None
        for _, sid in versions:
            snap = self._snapshots.get(sid)
            if snap is None:
                continue
            snap_ts = datetime.fromisoformat(snap.snapshot_at.replace("Z", "+00:00"))
            if snap_ts <= target_ts:
                candidate = snap
        return candidate

    def list_versions(
        self,
        entity_id: str,
        feature_group: str,
    ) -> List[Dict[str, Any]]:
        """Return all version metadata for an entity/group, newest first."""
        index_key = f"{entity_id}::{feature_group}"
        versions = self._version_index.get(index_key, [])
        results = []
        for version_num, sid in reversed(versions):
            snap = self._snapshots.get(sid)
            if snap:
                results.append({
                    "version": version_num,
                    "snapshot_id": sid,
                    "snapshot_at": snap.snapshot_at,
                    "pipeline_run_id": snap.pipeline_run_id,
                    "quality_score": snap.data_quality_score,
                    "tags": snap.tags,
                })
        return results

    # ------------------------------------------------------------------
    # Diff
    # ------------------------------------------------------------------

    def diff(
        self,
        snapshot_id_a: str,
        snapshot_id_b: str,
    ) -> Optional[VersionDiff]:
        """
        Compute the feature-level difference between two snapshots.
        Returns None if either snapshot is not found.
        """
        snap_a = self._snapshots.get(snapshot_id_a)
        snap_b = self._snapshots.get(snapshot_id_b)
        if snap_a is None or snap_b is None:
            return None

        keys_a = set(snap_a.features.keys())
        keys_b = set(snap_b.features.keys())

        added = sorted(keys_b - keys_a)
        removed = sorted(keys_a - keys_b)
        changed: Dict[str, Dict[str, Any]] = {}

        for key in keys_a & keys_b:
            val_a = snap_a.features[key]
            val_b = snap_b.features[key]
            if val_a != val_b:
                changed[key] = {"from": val_a, "to": val_b}

        from_ver = min(snap_a.version, snap_b.version)
        to_ver = max(snap_a.version, snap_b.version)

        return VersionDiff(
            entity_id=snap_a.entity_id,
            feature_group=snap_a.feature_group,
            from_version=from_ver,
            to_version=to_ver,
            added_features=added,
            removed_features=removed,
            changed_features=changed,
            diff_at=datetime.now(timezone.utc).isoformat(),
        )

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------

    def stats(self) -> Dict[str, Any]:
        return {
            "total_snapshots": len(self._snapshots),
            "total_entity_groups": len(self._version_index),
            "entity_group_versions": {
                k: len(v) for k, v in self._version_index.items()
            },
        }
