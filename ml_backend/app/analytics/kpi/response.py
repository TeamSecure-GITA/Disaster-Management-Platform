"""
Emergency response efficiency and SLA KPI analytics.

Calculates Mean Time to Detect (MTTD), Mean Time to Dispatch (MTTDp),
Mean Time to Arrive (MTTA), and emergency SLA compliance rates.
"""

from __future__ import annotations

import statistics
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


@dataclass
class ResponseTimeBenchmarks:
    """Mean and percentile response time latencies in minutes."""

    mttd_minutes: float  # Mean Time To Detect
    mttdp_minutes: float  # Mean Time To Dispatch
    mtta_minutes: float  # Mean Time To Arrive (on-scene)
    mttc_minutes: float  # Mean Time To Contain / Stabilize
    mttr_hours: float    # Mean Time To Resolve / Close

    p90_dispatch_minutes: float
    p90_arrival_minutes: float


@dataclass
class ResponseSLACompliance:
    """Service Level Agreement (SLA) fulfillment breakdown."""

    target_dispatch_minutes: float
    target_arrival_minutes: float
    total_incidents: int
    dispatch_sla_met_count: int
    arrival_sla_met_count: int
    dispatch_sla_compliance_pct: float
    arrival_sla_compliance_pct: float
    rescue_success_rate_pct: float


@dataclass
class ResponseKPIReport:
    """Consolidated emergency response performance report."""

    generated_at: str
    response_score: float  # 0 to 100
    times: ResponseTimeBenchmarks
    sla: ResponseSLACompliance
    overall_performance_grade: str  # Excellent (A), Good (B), Fair (C), Degraded (D), Critical (F)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "generated_at": self.generated_at,
            "response_score": round(self.response_score, 2),
            "performance_grade": self.overall_performance_grade,
            "times": asdict(self.times),
            "sla": asdict(self.sla),
        }


class ResponseKPICalculator:
    """
    Evaluates response timeline metrics against international emergency benchmarks (NFPA 1710/1221).
    """

    @classmethod
    def calculate_from_records(
        cls,
        dispatch_delays_min: Sequence[Any] = (),
        arrival_delays_min: Sequence[float] = (),
        detection_delays_min: Optional[Sequence[float]] = None,
        containment_delays_min: Optional[Sequence[float]] = None,
        resolution_delays_hr: Optional[Sequence[float]] = None,
        successful_rescues: int = 100,
        total_rescue_requests: int = 100,
        target_dispatch_min: float = 2.0,  # 2 minute dispatch SLA
        target_arrival_min: float = 8.0,   # 8 minute on-scene arrival SLA
    ) -> ResponseKPIReport:
        """
        Calculate latency averages, SLA compliance, and grade response performance.
        """
        if dispatch_delays_min and isinstance(dispatch_delays_min[0], dict):
            arrival_delays_min = [float(r.get("arrival_delay", 0.0)) for r in dispatch_delays_min]
            dispatch_delays_min = [float(r.get("dispatch_delay", 0.0)) for r in dispatch_delays_min]

        n_incidents = max(len(dispatch_delays_min), 1)

        def safe_mean(arr: Optional[Sequence[float]]) -> float:
            return statistics.mean(arr) if arr else 0.0

        def safe_pct(arr: Optional[Sequence[float]], p: float) -> float:
            if not arr:
                return 0.0
            sorted_arr = sorted(arr)
            idx = int(p * (len(sorted_arr) - 1))
            return sorted_arr[min(idx, len(sorted_arr) - 1)]

        mttd = safe_mean(detection_delays_min) if detection_delays_min else 1.5
        mttdp = safe_mean(dispatch_delays_min)
        mtta = safe_mean(arrival_delays_min)
        mttc = safe_mean(containment_delays_min) if containment_delays_min else (mtta * 2.5)
        mttr = safe_mean(resolution_delays_hr) if resolution_delays_hr else 4.0

        p90_disp = safe_pct(dispatch_delays_min, 0.90)
        p90_arr = safe_pct(arrival_delays_min, 0.90)

        # SLA checks
        disp_met = sum(1 for d in dispatch_delays_min if d <= target_dispatch_min)
        arr_met = sum(1 for a in arrival_delays_min if a <= target_arrival_min)

        disp_sla_pct = (disp_met / n_incidents) * 100.0 if n_incidents > 0 else 0.0
        arr_sla_pct = (arr_met / n_incidents) * 100.0 if n_incidents > 0 else 0.0

        rescue_rate = (
            (successful_rescues / total_rescue_requests) * 100.0
            if total_rescue_requests > 0
            else 100.0
        )
        rescue_rate = min(100.0, rescue_rate)

        # Composite score
        # 40% arrival SLA, 30% dispatch SLA, 30% rescue success
        score = 0.40 * arr_sla_pct + 0.30 * disp_sla_pct + 0.30 * rescue_rate
        score = max(0.0, min(100.0, score))

        if score >= 90.0:
            grade = "A (Optimal)"
        elif score >= 80.0:
            grade = "B (Good)"
        elif score >= 70.0:
            grade = "C (Satisfactory)"
        elif score >= 60.0:
            grade = "D (Degraded)"
        else:
            grade = "F (Critical Deficit)"

        times = ResponseTimeBenchmarks(
            mttd_minutes=round(mttd, 2),
            mttdp_minutes=round(mttdp, 2),
            mtta_minutes=round(mtta, 2),
            mttc_minutes=round(mttc, 2),
            mttr_hours=round(mttr, 2),
            p90_dispatch_minutes=round(p90_disp, 2),
            p90_arrival_minutes=round(p90_arr, 2),
        )

        sla = ResponseSLACompliance(
            target_dispatch_minutes=target_dispatch_min,
            target_arrival_minutes=target_arrival_min,
            total_incidents=n_incidents,
            dispatch_sla_met_count=disp_met,
            arrival_sla_met_count=arr_met,
            dispatch_sla_compliance_pct=round(disp_sla_pct, 2),
            arrival_sla_compliance_pct=round(arr_sla_pct, 2),
            rescue_success_rate_pct=round(rescue_rate, 2),
        )

        return ResponseKPIReport(
            generated_at=datetime.now(timezone.utc).isoformat(),
            response_score=score,
            times=times,
            sla=sla,
            overall_performance_grade=grade,
        )
