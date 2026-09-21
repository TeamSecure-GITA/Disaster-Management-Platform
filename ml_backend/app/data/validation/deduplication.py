"""
Data deduplication.

Identifies and suppresses duplicate records that arise from:
- Multiple sensors reporting the same physical reading
- Retry storms when upstream APIs time out
- Crowdsourced reports submitted multiple times by the same reporter
- Overlapping satellite scene coverage

Uses content-addressed fingerprinting (SHA-256 of canonical key fields)
for exact duplicates and approximate spatial-temporal proximity matching
for near-duplicate detection.
"""

from __future__ import annotations

import hashlib
import math
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class DuplicateCheckResult:
    """Result of a single deduplication check."""

    record_id: str
    is_duplicate: bool
    duplicate_of: Optional[str]     # ID of the original record
    match_type: Optional[str]       # "exact" | "near" | None
    similarity_score: float = 0.0   # 0.0 – 1.0 (1.0 = identical)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DeduplicationSummary:
    """Summary of a batch deduplication pass."""

    total_checked: int
    unique: int
    exact_duplicates: int
    near_duplicates: int
    dedup_rate_pct: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Fingerprint utilities
# ---------------------------------------------------------------------------

def _canonical_str(value: Any) -> str:
    """Normalise a value to a canonical string for fingerprinting."""
    if value is None:
        return ""
    if isinstance(value, float):
        return f"{value:.4f}"
    return str(value).strip().lower()


def _build_fingerprint(fields: Dict[str, Any], key_fields: List[str]) -> str:
    """
    Build a SHA-256 fingerprint from specified key fields.
    Field values are sorted by field name to ensure order-independence.
    """
    parts = "|".join(
        f"{k}={_canonical_str(fields.get(k))}"
        for k in sorted(key_fields)
    )
    return hashlib.sha256(parts.encode()).hexdigest()


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
    return earth_r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _time_diff_seconds(ts1: str, ts2: str) -> Optional[float]:
    """Absolute time difference in seconds between two ISO-8601 strings."""
    try:
        t1 = datetime.fromisoformat(ts1.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(ts2.replace("Z", "+00:00"))
        return abs((t1 - t2).total_seconds())
    except (ValueError, AttributeError):
        return None


# ---------------------------------------------------------------------------
# Schema-specific key field configurations
# ---------------------------------------------------------------------------

_KEY_FIELDS: Dict[str, List[str]] = {
    "weather_observation": [
        "station_id", "observed_at",
    ],
    "sensor_reading": [
        "sensor_id", "observed_at", "value",
    ],
    "citizen_report": [
        "latitude", "longitude", "description",
    ],
    "historical_event": [
        "event_id",
    ],
    "satellite_scene": [
        "scene_id",
    ],
    "drone_image": [
        "image_id",
    ],
}


class DeduplicationEngine:
    """
    Exact and near-duplicate detection across all data ingestion types.

    Two-layer strategy:
    1. **Exact duplicate**: identical fingerprint → immediately rejected.
    2. **Near duplicate**: spatially and temporally proximate records
       within configurable thresholds.

    Example::

        deduper = DeduplicationEngine()
        result = deduper.check(record, schema_name="sensor_reading")
        if result.is_duplicate:
            print(f"Skipping duplicate of {result.duplicate_of}")
    """

    def __init__(
        self,
        near_dup_radius_km: float = 0.5,
        near_dup_time_window_s: float = 60.0,
        near_dup_enabled: bool = True,
    ):
        self.near_dup_radius_km = near_dup_radius_km
        self.near_dup_time_window_s = near_dup_time_window_s
        self.near_dup_enabled = near_dup_enabled

        # Fingerprint store: fingerprint -> record_id
        self._exact_index: Dict[str, str] = {}

        # Near-dup spatial index: schema -> list of (record_id, lat, lon, timestamp_str)
        self._spatial_index: Dict[str, List[Tuple[str, float, float, str]]] = defaultdict(list)

        # All registered record IDs
        self._seen_ids: Set[str] = set()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def check(
        self,
        record: Dict[str, Any],
        schema_name: str = "generic",
        record_id: Optional[str] = None,
    ) -> DuplicateCheckResult:
        """
        Check a single record for exact or near-duplicate status.

        If not a duplicate, register the record in the index.
        """
        rid = record_id or self._extract_id(record)
        key_fields = _KEY_FIELDS.get(schema_name, list(record.keys())[:5])

        fingerprint = _build_fingerprint(record, key_fields)

        # --- Exact duplicate check ---
        if fingerprint in self._exact_index:
            original_id = self._exact_index[fingerprint]
            return DuplicateCheckResult(
                record_id=rid,
                is_duplicate=True,
                duplicate_of=original_id,
                match_type="exact",
                similarity_score=1.0,
            )

        # --- Near-duplicate check ---
        if self.near_dup_enabled:
            near_match = self._near_dup_check(record, schema_name, rid)
            if near_match:
                return near_match

        # --- Register as new record ---
        self._exact_index[fingerprint] = rid
        self._seen_ids.add(rid)
        self._register_spatial(record, schema_name, rid)

        return DuplicateCheckResult(
            record_id=rid,
            is_duplicate=False,
            duplicate_of=None,
            match_type=None,
            similarity_score=0.0,
        )

    def check_batch(
        self,
        records: List[Dict[str, Any]],
        schema_name: str = "generic",
    ) -> Tuple[List[DuplicateCheckResult], DeduplicationSummary]:
        """
        Check a batch of records for duplicates.

        Returns individual results and an aggregate summary.
        """
        results = [self.check(r, schema_name=schema_name) for r in records]
        exact = sum(1 for r in results if r.is_duplicate and r.match_type == "exact")
        near = sum(1 for r in results if r.is_duplicate and r.match_type == "near")
        total = len(results)
        unique = total - exact - near

        summary = DeduplicationSummary(
            total_checked=total,
            unique=unique,
            exact_duplicates=exact,
            near_duplicates=near,
            dedup_rate_pct=round(((exact + near) / total) * 100, 2) if total else 0.0,
        )
        return results, summary

    def filter_unique(
        self,
        records: List[Dict[str, Any]],
        schema_name: str = "generic",
    ) -> List[Dict[str, Any]]:
        """Return only non-duplicate records from a batch."""
        unique = []
        for r in records:
            result = self.check(r, schema_name=schema_name)
            if not result.is_duplicate:
                unique.append(r)
        return unique

    def reset(self) -> None:
        """Clear all deduplication indexes (e.g. for testing or daily resets)."""
        self._exact_index.clear()
        self._spatial_index.clear()
        self._seen_ids.clear()

    def stats(self) -> Dict[str, Any]:
        return {
            "unique_records_registered": len(self._seen_ids),
            "exact_fingerprints_indexed": len(self._exact_index),
            "spatial_index_schemas": list(self._spatial_index.keys()),
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _near_dup_check(
        self,
        record: Dict[str, Any],
        schema_name: str,
        rid: str,
    ) -> Optional[DuplicateCheckResult]:
        lat = self._safe_float(record.get("latitude"))
        lon = self._safe_float(record.get("longitude"))
        ts = record.get("observed_at") or record.get("reported_at")

        if lat is None or lon is None:
            return None

        candidates = self._spatial_index.get(schema_name, [])
        for orig_id, orig_lat, orig_lon, orig_ts in candidates:
            dist = _haversine_km(lat, lon, orig_lat, orig_lon)
            if dist > self.near_dup_radius_km:
                continue
            if ts and orig_ts:
                dt = _time_diff_seconds(ts, orig_ts)
                if dt is not None and dt > self.near_dup_time_window_s:
                    continue
            # Near-dup found
            sim = max(0.0, 1.0 - dist / self.near_dup_radius_km)
            return DuplicateCheckResult(
                record_id=rid,
                is_duplicate=True,
                duplicate_of=orig_id,
                match_type="near",
                similarity_score=round(sim, 3),
            )
        return None

    def _register_spatial(
        self,
        record: Dict[str, Any],
        schema_name: str,
        rid: str,
    ) -> None:
        lat = self._safe_float(record.get("latitude"))
        lon = self._safe_float(record.get("longitude"))
        ts = record.get("observed_at") or record.get("reported_at") or ""
        if lat is not None and lon is not None:
            self._spatial_index[schema_name].append((rid, lat, lon, ts))

    @staticmethod
    def _extract_id(record: Dict[str, Any]) -> str:
        for key in ["sensor_id", "report_id", "scene_id", "event_id", "drone_id", "id"]:
            v = record.get(key)
            if v:
                return str(v)
        return f"rec-{hashlib.md5(str(record).encode()).hexdigest()[:8]}"

    @staticmethod
    def _safe_float(v: Any) -> Optional[float]:
        try:
            return float(v) if v is not None else None
        except (TypeError, ValueError):
            return None
