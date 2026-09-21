"""
Real-time operational dashboard aggregation service.

Constructs comprehensive situational awareness snapshots for emergency control centers,
combining active incidents, hazard telemetry, shelter occupancy, and rescue resources.
"""

from __future__ import annotations

import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .aggregations import DimensionalAggregate, RealtimeAggregator
from .metrics import MetricSummary, RealtimeMetricTracker


@dataclass
class RegionalSituationalState:
    """Real-time situational state for a specific operational region."""

    region_id: str
    region_name: str
    threat_level: str  # low, elevated, severe, catastrophic
    active_incidents_count: int = 0
    critical_incidents_count: int = 0
    active_hazards: List[str] = field(default_factory=list)
    shelters_open: int = 0
    total_shelter_capacity: int = 0
    current_shelter_occupancy: int = 0
    responders_deployed: int = 0
    last_updated: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    @property
    def shelter_occupancy_rate(self) -> float:
        if self.total_shelter_capacity <= 0:
            return 0.0
        return round((self.current_shelter_occupancy / self.total_shelter_capacity) * 100.0, 2)

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["shelter_occupancy_rate"] = self.shelter_occupancy_rate
        return data


@dataclass
class DashboardOverview:
    """Executive operational dashboard snapshot."""

    generated_at: str
    status: str
    total_active_incidents: int
    critical_incidents: int
    active_hazards_count: int
    people_evacuated: int
    shelter_utilization_pct: float
    units_dispatched: int
    regional_breakdown: List[RegionalSituationalState] = field(default_factory=list)
    severity_distribution: Dict[str, int] = field(default_factory=dict)
    hazard_distribution: Dict[str, int] = field(default_factory=dict)
    active_alerts: List[Dict[str, Any]] = field(default_factory=list)
    metrics_summary: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "generated_at": self.generated_at,
            "status": self.status,
            "total_active_incidents": self.total_active_incidents,
            "critical_incidents": self.critical_incidents,
            "active_hazards_count": self.active_hazards_count,
            "people_evacuated": self.people_evacuated,
            "shelter_utilization_pct": self.shelter_utilization_pct,
            "units_dispatched": self.units_dispatched,
            "regional_breakdown": [r.to_dict() for r in self.regional_breakdown],
            "severity_distribution": self.severity_distribution,
            "hazard_distribution": self.hazard_distribution,
            "active_alerts": self.active_alerts,
            "metrics_summary": self.metrics_summary,
        }


class RealtimeDashboardService:
    """
    Synthesizes incoming operational telemetry streams into real-time dashboard snapshots.
    """

    def __init__(self, metric_tracker: Optional[RealtimeMetricTracker] = None):
        self.metric_tracker = metric_tracker or RealtimeMetricTracker()
        self.aggregator = RealtimeAggregator()
        self._regional_states: Dict[str, RegionalSituationalState] = {}
        self._active_alerts: List[Dict[str, Any]] = []

    def update_regional_state(self, state: RegionalSituationalState) -> None:
        """Register or update a region's live operational status."""
        self._regional_states[state.region_id] = state

    def add_alert(
        self,
        alert_type: str,
        title: str,
        severity: str,
        region: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Post a live situational alert."""
        alert = {
            "id": f"alert-{int(time.time() * 1000)}",
            "type": alert_type,
            "title": title,
            "severity": severity,
            "region": region or "all",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": details or {},
        }
        self._active_alerts.append(alert)
        if len(self._active_alerts) > 100:
            self._active_alerts.pop(0)

    def generate_snapshot(
        self,
        raw_incidents: Optional[List[Dict[str, Any]]] = None,
        raw_hazards: Optional[List[Dict[str, Any]]] = None,
        region_filter: Optional[str] = None,
    ) -> DashboardOverview:
        """
        Assemble the unified live operational dashboard snapshot.
        """
        incidents = raw_incidents or []
        hazards = raw_hazards or []

        if region_filter:
            incidents = [i for i in incidents if i.get("region") == region_filter]
            hazards = [h for h in hazards if h.get("region") == region_filter]

        severity_agg = self.aggregator.aggregate_by_dimension(incidents, "severity")
        hazard_agg = self.aggregator.aggregate_by_dimension(hazards, "hazard_type")

        total_capacity = 0
        total_occupancy = 0
        total_evacuated = 0
        total_dispatched = 0

        filtered_regions = []
        for reg in self._regional_states.values():
            if region_filter and reg.region_id != region_filter:
                continue
            total_capacity += reg.total_shelter_capacity
            total_occupancy += reg.current_shelter_occupancy
            total_dispatched += reg.responders_deployed
            filtered_regions.append(reg)

        total_evacuated = total_occupancy
        overall_shelter_pct = (
            round((total_occupancy / total_capacity) * 100.0, 2)
            if total_capacity > 0
            else 0.0
        )

        critical_count = severity_agg.category_counts.get("critical", 0)
        overall_status = "nominal"
        if critical_count > 10 or overall_shelter_pct > 90.0:
            overall_status = "catastrophic"
        elif critical_count > 3 or overall_shelter_pct > 75.0:
            overall_status = "critical"
        elif len(incidents) > 0:
            overall_status = "active_response"

        recent_alerts = [
            a for a in self._active_alerts
            if not region_filter or a.get("region") in (region_filter, "all")
        ][-20:]

        metrics_snap = self.metric_tracker.get_all_summaries()

        return DashboardOverview(
            generated_at=datetime.now(timezone.utc).isoformat(),
            status=overall_status,
            total_active_incidents=len(incidents),
            critical_incidents=critical_count,
            active_hazards_count=len(hazards),
            people_evacuated=total_evacuated,
            shelter_utilization_pct=overall_shelter_pct,
            units_dispatched=total_dispatched,
            regional_breakdown=filtered_regions,
            severity_distribution=severity_agg.category_counts,
            hazard_distribution=hazard_agg.category_counts,
            active_alerts=recent_alerts,
            metrics_summary=metrics_snap,
        )
