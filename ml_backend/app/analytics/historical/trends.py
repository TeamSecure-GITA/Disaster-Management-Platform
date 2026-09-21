"""
Historical multi-year trend and comparative analytics.

Calculates Year-Over-Year (YoY) trajectories, decade-scale trends, and long-term
improvements in disaster response and casualty reduction.
"""

from __future__ import annotations

import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence

from .hazards import HazardEventRecord
from .incidents import IncidentRecord


@dataclass
class AnnualMetricSummary:
    """Annual aggregated metrics for trend modeling."""

    year: int
    incident_count: int
    hazard_events_count: int
    casualties: int
    injuries: int
    economic_loss_usd: float
    avg_response_time_minutes: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class YearOverYearChange:
    """Comparative change between two consecutive years."""

    from_year: int
    to_year: int
    incident_growth_pct: float
    casualty_growth_pct: float
    economic_loss_growth_pct: float
    response_time_improvement_pct: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class HistoricalTrendReport:
    """Long-term historical trend report."""

    start_year: int
    end_year: int
    annual_series: List[AnnualMetricSummary]
    yoy_changes: List[YearOverYearChange]
    compound_annual_growth_rate: Dict[str, float]
    trend_direction: Dict[str, str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start_year": self.start_year,
            "end_year": self.end_year,
            "annual_series": [s.to_dict() for s in self.annual_series],
            "yoy_changes": [y.to_dict() for y in self.yoy_changes],
            "compound_annual_growth_rate": self.compound_annual_growth_rate,
            "trend_direction": self.trend_direction,
        }


class HistoricalTrendAnalyzer:
    """
    Computes comparative historical time-series analytics and long-term climate resilience curves.
    """

    def __init__(
        self,
        incidents: Optional[Sequence[IncidentRecord]] = None,
        hazards: Optional[Sequence[HazardEventRecord]] = None,
    ):
        self.incidents = list(incidents or [])
        self.hazards = list(hazards or [])

    def compute_annual_metrics(self) -> List[AnnualMetricSummary]:
        """Aggregate all records into annual summaries."""
        years_set = set()
        inc_by_year: Dict[int, List[IncidentRecord]] = defaultdict(list)
        haz_by_year: Dict[int, List[HazardEventRecord]] = defaultdict(list)

        for inc in self.incidents:
            y = inc.parsed_datetime.year
            years_set.add(y)
            inc_by_year[y].append(inc)

        for haz in self.hazards:
            y = haz.parsed_start.year
            years_set.add(y)
            haz_by_year[y].append(haz)

        if not years_set:
            current_year = datetime.now().year
            return [
                AnnualMetricSummary(
                    year=current_year,
                    incident_count=0,
                    hazard_events_count=0,
                    casualties=0,
                    injuries=0,
                    economic_loss_usd=0.0,
                    avg_response_time_minutes=0.0,
                )
            ]

        summaries = []
        for year in sorted(years_set):
            incs = inc_by_year[year]
            hazs = haz_by_year[year]

            total_cas = sum(i.casualties for i in incs)
            total_inj = sum(i.injuries for i in incs)
            total_loss = sum(i.economic_loss_usd for i in incs) + sum(h.direct_damages_usd for h in hazs)
            resp_times = [i.response_time_minutes for i in incs if i.response_time_minutes > 0]
            avg_resp = statistics.mean(resp_times) if resp_times else 0.0

            summaries.append(
                AnnualMetricSummary(
                    year=year,
                    incident_count=len(incs),
                    hazard_events_count=len(hazs),
                    casualties=total_cas,
                    injuries=total_inj,
                    economic_loss_usd=total_loss,
                    avg_response_time_minutes=round(avg_resp, 2),
                )
            )
        return summaries

    def compute_yoy_changes(
        self,
        annual_series: List[AnnualMetricSummary],
    ) -> List[YearOverYearChange]:
        """Calculate percentage shifts year over year."""
        changes = []
        for i in range(1, len(annual_series)):
            prev = annual_series[i - 1]
            curr = annual_series[i]

            def pct_chg(a: float, b: float) -> float:
                if a == 0:
                    return 100.0 if b > 0 else 0.0
                return round(((b - a) / a) * 100.0, 2)

            # Response time improvement: negative growth in time = positive improvement
            resp_improv = pct_chg(curr.avg_response_time_minutes, prev.avg_response_time_minutes)

            changes.append(
                YearOverYearChange(
                    from_year=prev.year,
                    to_year=curr.year,
                    incident_growth_pct=pct_chg(prev.incident_count, curr.incident_count),
                    casualty_growth_pct=pct_chg(prev.casualties, curr.casualties),
                    economic_loss_growth_pct=pct_chg(prev.economic_loss_usd, curr.economic_loss_usd),
                    response_time_improvement_pct=resp_improv,
                )
            )
        return changes

    def generate_report(self) -> HistoricalTrendReport:
        """Produce a comprehensive multi-year trend report."""
        annual = self.compute_annual_metrics()
        yoy = self.compute_yoy_changes(annual)

        cagr: Dict[str, float] = {}
        direction: Dict[str, str] = {}

        if len(annual) > 1:
            n_years = max(annual[-1].year - annual[0].year, 1)

            def calc_cagr(start_val: float, end_val: float) -> float:
                if start_val <= 0 or end_val <= 0:
                    return 0.0
                return round(((end_val / start_val) ** (1.0 / n_years) - 1.0) * 100.0, 2)

            cagr["incidents"] = calc_cagr(annual[0].incident_count, annual[-1].incident_count)
            cagr["casualties"] = calc_cagr(annual[0].casualties, annual[-1].casualties)
            cagr["economic_loss"] = calc_cagr(annual[0].economic_loss_usd, annual[-1].economic_loss_usd)

            for key, val in cagr.items():
                if val > 5.0:
                    direction[key] = "rapidly_increasing"
                elif val > 0:
                    direction[key] = "increasing"
                elif val < -5.0:
                    direction[key] = "rapidly_decreasing"
                elif val < 0:
                    direction[key] = "decreasing"
                else:
                    direction[key] = "stable"
        else:
            cagr = {"incidents": 0.0, "casualties": 0.0, "economic_loss": 0.0}
            direction = {"incidents": "stable", "casualties": "stable", "economic_loss": "stable"}

        return HistoricalTrendReport(
            start_year=annual[0].year,
            end_year=annual[-1].year,
            annual_series=annual,
            yoy_changes=yoy,
            compound_annual_growth_rate=cagr,
            trend_direction=direction,
        )
