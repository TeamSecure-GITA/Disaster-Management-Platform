"""
Digital-twin scenario state registry.

Tracks the lifecycle of scenario runs: pending → running → success/failed.
Provides an in-memory store for recent results so API endpoints can poll
for long-running scenarios without blocking a request thread.

Design notes:
    - Thread-safe only for asyncio single-worker setups (CPython GIL).
    - For multi-worker deployments, replace the in-memory dict with Redis.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .entities import ScenarioResult, SimulationStatus


# ============================================================
# Scenario run record
# ============================================================

@dataclass
class ScenarioRecord:
    """
    Lifecycle record for a single scenario run.

    Attributes:
        scenario_id: Unique run identifier.
        status: Current lifecycle state.
        submitted_at: UTC timestamp when the run was submitted.
        started_at: UTC timestamp when execution began (None if pending).
        completed_at: UTC timestamp when the run finished (None if in-flight).
        result: The final ScenarioResult once execution succeeds.
        error: Error message string on failure.
        tags: Arbitrary string labels for filtering/search.
    """

    scenario_id: str
    status: SimulationStatus = SimulationStatus.PENDING
    submitted_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[ScenarioResult] = None
    error: Optional[str] = None
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "scenario_id": self.scenario_id,
            "status": self.status.value,
            "submitted_at": self.submitted_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "error": self.error,
            "tags": self.tags,
            "result": self.result.to_dict() if self.result else None,
        }


# ============================================================
# Registry
# ============================================================

class ScenarioRegistry:
    """
    In-memory scenario lifecycle registry.

    Maintains a bounded history of recent ScenarioRecord objects.
    Older records are evicted when the registry exceeds ``max_records``.

    Usage::

        registry = ScenarioRegistry(max_records=500)

        # Submit a new run.
        record = registry.submit("flood-abc123", tags=["flood", "odisha"])

        # Mark it as running.
        registry.mark_running("flood-abc123")

        # Mark success with result.
        registry.mark_success("flood-abc123", result=scenario_result)

        # Retrieve.
        record = registry.get("flood-abc123")
    """

    def __init__(self, max_records: int = 500):
        self.max_records = max_records
        self._records: Dict[str, ScenarioRecord] = {}
        self._lock = threading.Lock()

    # --------------------------------------------------------
    # Write operations
    # --------------------------------------------------------

    def submit(
        self,
        scenario_id: str,
        tags: Optional[List[str]] = None,
    ) -> ScenarioRecord:
        """Register a new scenario run in PENDING state."""

        record = ScenarioRecord(
            scenario_id=scenario_id,
            status=SimulationStatus.PENDING,
            tags=tags or [],
        )

        with self._lock:
            self._evict_if_needed()
            self._records[scenario_id] = record

        return record

    def mark_running(self, scenario_id: str) -> None:
        """Transition a scenario from PENDING → RUNNING."""

        with self._lock:
            record = self._records.get(scenario_id)

            if record:
                record.status = SimulationStatus.RUNNING
                record.started_at = datetime.now(
                    timezone.utc
                ).isoformat()

    def mark_success(
        self,
        scenario_id: str,
        result: ScenarioResult,
    ) -> None:
        """Transition a scenario to SUCCESS and store its result."""

        with self._lock:
            record = self._records.get(scenario_id)

            if record:
                record.status = SimulationStatus.SUCCESS
                record.result = result
                record.completed_at = datetime.now(
                    timezone.utc
                ).isoformat()

    def mark_failed(
        self,
        scenario_id: str,
        error: str,
    ) -> None:
        """Transition a scenario to FAILED and store the error message."""

        with self._lock:
            record = self._records.get(scenario_id)

            if record:
                record.status = SimulationStatus.FAILED
                record.error = error
                record.completed_at = datetime.now(
                    timezone.utc
                ).isoformat()

    def mark_cancelled(self, scenario_id: str) -> None:
        """Transition a scenario to CANCELLED."""

        with self._lock:
            record = self._records.get(scenario_id)

            if record:
                record.status = SimulationStatus.CANCELLED
                record.completed_at = datetime.now(
                    timezone.utc
                ).isoformat()

    # --------------------------------------------------------
    # Read operations
    # --------------------------------------------------------

    def get(self, scenario_id: str) -> Optional[ScenarioRecord]:
        """Retrieve a scenario record by ID."""

        return self._records.get(scenario_id)

    def list_all(
        self,
        status_filter: Optional[SimulationStatus] = None,
        limit: int = 100,
    ) -> List[ScenarioRecord]:
        """
        Return recently submitted scenarios, optionally filtered by status.

        Args:
            status_filter: If provided, return only records with this status.
            limit: Maximum number of records to return (most recent first).

        Returns:
            List of ScenarioRecord objects.
        """

        records = list(self._records.values())

        if status_filter is not None:
            records = [
                r for r in records
                if r.status == status_filter
            ]

        # Most recently submitted first.
        records.sort(key=lambda r: r.submitted_at, reverse=True)

        return records[:limit]

    def summary(self) -> Dict[str, Any]:
        """Return high-level registry statistics."""

        total = len(self._records)
        counts: Dict[str, int] = {}

        for record in self._records.values():
            key = record.status.value
            counts[key] = counts.get(key, 0) + 1

        return {
            "total_records": total,
            "max_records": self.max_records,
            "by_status": counts,
        }

    # --------------------------------------------------------
    # Internal
    # --------------------------------------------------------

    def _evict_if_needed(self) -> None:
        """
        Remove the oldest 10 % of records when the registry is full.

        Must be called while holding self._lock.
        """

        if len(self._records) < self.max_records:
            return

        evict_count = max(1, self.max_records // 10)

        oldest = sorted(
            self._records.keys(),
            key=lambda sid: self._records[sid].submitted_at,
        )

        for sid in oldest[:evict_count]:
            del self._records[sid]


# ============================================================
# Public exports
# ============================================================

__all__ = [
    "ScenarioRecord",
    "ScenarioRegistry",
]
