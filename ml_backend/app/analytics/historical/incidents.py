"""
Historical incident analytics.

Analyzes past disaster incident records, response latencies, casualty impacts,
and resolution patterns across temporal and geographic slices.
"""

from __future__ import annotations

import math
import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class IncidentRecord:
    """Historical record of an emergency incident."""

    id: str
    timestamp: str  # ISO-8601
    hazard_type: str
    severity: str  # low, medium, high, critical
    region: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    casualties: int = 0
    injuries: int = 0
    economic_loss_usd: float = 0.0
    response_time_minutes: float = 0.0
    resolution_time_hours: float = 0.0
    status: str = "resolved"

    @property
    def parsed_datetime(self) -> datetime:
        try:
            return datetime.fromisoformat(self.timestamp)
        except ValueError:
            return datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class IncidentStatistics:
    """Statistical summary of historical incidents."""

    total_incidents: int
    by_severity: Dict[str, int]
    by_hazard: Dict[str, int]
    by_region: Dict[str, int]
    total_casualties: int
    total_injuries: int
    total_economic_loss_usd: float
    avg_response_time_minutes: float
    median_response_time_minutes: float
    p90_response_time_minutes: float
    avg_resolution_time_hours: float
    p90_resolution_time_hours: float
    casualty_rate_per_incident: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_incidents": self.total_incidents,
            "by_severity": self.by_severity,
            "by_hazard": self.by_hazard,
            "by_region": self.by_region,
            "total_casualties": self.total_casualties,
            "total_injuries": self.total_injuries,
            "total_economic_loss_usd": round(self.total_economic_loss_usd, 2),
            "avg_response_time_minutes": round(self.avg_response_time_minutes, 2),
            "median_response_time_minutes": round(self.median_response_time_minutes, 2),
            "p90_response_time_minutes": round(self.p90_response_time_minutes, 2),
            "avg_resolution_time_hours": round(self.avg_resolution_time_hours, 2),
            "p90_resolution_time_hours": round(self.p90_resolution_time_hours, 2),
            "casualty_rate_per_incident": round(self.casualty_rate_per_incident, 4),
        }


class HistoricalIncidentAnalyzer:
    """
    Analyzes historical incident archives to extract patterns, impacts, and response efficiency.
    """

    def __init__(self, records: Optional[Sequence[IncidentRecord]] = None):
        self.records: List[IncidentRecord] = list(records or [])

    def add_records(self, records: Sequence[IncidentRecord]) -> None:
        self.records.extend(records)

    def filter(
        self,
        hazard_type: Optional[str] = None,
        severity: Optional[str] = None,
        region: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[IncidentRecord]:
        """Filter incidents by hazard, severity, region, or temporal window."""
        results = self.records
        if hazard_type:
            results = [r for r in results if r.hazard_type.lower() == hazard_type.lower()]
        if severity:
            results = [r for r in results if r.severity.lower() == severity.lower()]
        if region:
            results = [r for r in results if r.region.lower() == region.lower()]
        if start_date:
            try:
                dt_start = datetime.fromisoformat(start_date)
                results = [r for r in results if r.parsed_datetime >= dt_start]
            except ValueError:
                pass
        if end_date:
            try:
                dt_end = datetime.fromisoformat(end_date)
                results = [r for r in results if r.parsed_datetime <= dt_end]
            except ValueError:
                pass
        return results

    def compute_statistics(
        self,
        records: Optional[Sequence[IncidentRecord]] = None,
    ) -> IncidentStatistics:
        """Calculate aggregate disaster statistics over the provided or loaded records."""
        dataset = list(records if records is not None else self.records)
        total = len(dataset)

        if total == 0:
            return IncidentStatistics(
                total_incidents=0,
                by_severity={},
                by_hazard={},
                by_region={},
                total_casualties=0,
                total_injuries=0,
                total_economic_loss_usd=0.0,
                avg_response_time_minutes=0.0,
                median_response_time_minutes=0.0,
                p90_response_time_minutes=0.0,
                avg_resolution_time_hours=0.0,
                p90_resolution_time_hours=0.0,
                casualty_rate_per_incident=0.0,
            )

        sev_counts: Dict[str, int] = defaultdict(int)
        haz_counts: Dict[str, int] = defaultdict(int)
        reg_counts: Dict[str, int] = defaultdict(int)
        total_cas = 0
        total_inj = 0
        total_loss = 0.0
        resp_times: List[float] = []
        resol_times: List[float] = []

        for r in dataset:
            sev_counts[r.severity.lower()] += 1
            haz_counts[r.hazard_type.lower()] += 1
            reg_counts[r.region.lower()] += 1
            total_cas += r.casualties
            total_inj += r.injuries
            total_loss += r.economic_loss_usd
            if r.response_time_minutes > 0:
                resp_times.append(r.response_time_minutes)
            if r.resolution_time_hours > 0:
                resol_times.append(r.resolution_time_hours)

        resp_sorted = sorted(resp_times) if resp_times else [0.0]
        resol_sorted = sorted(resol_times) if resol_times else [0.0]

        def percentile(sorted_arr: List[float], p: float) -> float:
            idx = int(p * (len(sorted_arr) - 1))
            return sorted_arr[min(idx, len(sorted_arr) - 1)]

        return IncidentStatistics(
            total_incidents=total,
            by_severity=dict(sev_counts),
            by_hazard=dict(haz_counts),
            by_region=dict(reg_counts),
            total_casualties=total_cas,
            total_injuries=total_inj,
            total_economic_loss_usd=total_loss,
            avg_response_time_minutes=statistics.mean(resp_times) if resp_times else 0.0,
            median_response_time_minutes=statistics.median(resp_times) if resp_times else 0.0,
            p90_response_time_minutes=percentile(resp_sorted, 0.90),
            avg_resolution_time_hours=statistics.mean(resol_times) if resol_times else 0.0,
            p90_resolution_time_hours=percentile(resol_sorted, 0.90),
            casualty_rate_per_incident=total_cas / total,
        )

    def group_by_temporal_unit(
        self,
        unit: str = "month",
        records: Optional[Sequence[IncidentRecord]] = None,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Group incidents into temporal periods ('year', 'month', 'day_of_week').
        """
        dataset = records if records is not None else self.records
        grouped: Dict[str, List[IncidentRecord]] = defaultdict(list)

        for r in dataset:
            dt = r.parsed_datetime
            if unit == "year":
                key = str(dt.year)
            elif unit == "day_of_week":
                key = dt.strftime("%A")
            else:  # month
                key = dt.strftime("%Y-%m")
            grouped[key].append(r)

        result: Dict[str, Dict[str, Any]] = {}
        for k, group in sorted(grouped.items()):
            stats = self.compute_statistics(group)
            result[k] = {
                "period": k,
                "incident_count": len(group),
                "casualties": stats.total_casualties,
                "economic_loss_usd": stats.total_economic_loss_usd,
                "avg_response_time_minutes": stats.avg_response_time_minutes,
            }
        return result
