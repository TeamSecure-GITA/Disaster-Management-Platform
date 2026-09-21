"""
Data quality assessment.

Measures completeness, consistency, timeliness, and plausibility of
incoming records. Produces a structured ``QualityReport`` with per-dimension
scores (0.0 – 1.0) and actionable improvement recommendations.

Quality scores feed the feature store's provenance metadata so downstream
ML models can weight training samples by data quality.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class QualityDimension:
    """Single quality dimension assessment."""

    name: str           # completeness | consistency | timeliness | plausibility
    score: float        # 0.0 – 1.0 (higher = better)
    passed: bool
    issues: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class QualityReport:
    """
    Holistic quality report for a single or batch of records.

    ``overall_score`` is the weighted harmonic mean of all dimension scores.
    Records scoring below ``min_acceptable_score`` should be quarantined.
    """

    record_id: str
    source: str
    overall_score: float            # 0.0 – 1.0
    quality_label: str              # "excellent" | "good" | "acceptable" | "poor" | "reject"
    dimensions: List[QualityDimension]
    recommendations: List[str]
    assessed_at: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "record_id": self.record_id,
            "source": self.source,
            "overall_score": round(self.overall_score, 3),
            "quality_label": self.quality_label,
            "dimensions": [d.to_dict() for d in self.dimensions],
            "recommendations": self.recommendations,
            "assessed_at": self.assessed_at,
        }

    @property
    def is_acceptable(self) -> bool:
        return self.overall_score >= 0.60


@dataclass
class BatchQualitySummary:
    """Aggregate quality summary over a batch of records."""

    total_records: int
    excellent: int        # ≥ 0.90
    good: int             # 0.75 – 0.89
    acceptable: int       # 0.60 – 0.74
    poor: int             # 0.40 – 0.59
    reject: int           # < 0.40
    mean_overall_score: float
    quarantine_rate_pct: float       # % of records scoring below acceptable

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _quality_label(score: float) -> str:
    if score >= 0.90:
        return "excellent"
    if score >= 0.75:
        return "good"
    if score >= 0.60:
        return "acceptable"
    if score >= 0.40:
        return "poor"
    return "reject"


def _harmonic_mean(values: List[float]) -> float:
    """Harmonic mean — penalises low outliers more strongly than arithmetic mean."""
    if not values:
        return 0.0
    inv_sum = sum(1.0 / max(v, 1e-9) for v in values)
    return len(values) / inv_sum


# ---------------------------------------------------------------------------
# Completeness assessment
# ---------------------------------------------------------------------------

def _assess_completeness(
    record: Dict[str, Any],
    required_fields: Sequence[str],
    optional_fields: Sequence[str],
) -> QualityDimension:
    issues: List[str] = []
    total = len(required_fields) + len(optional_fields)
    present = 0

    for f in required_fields:
        v = record.get(f)
        if v is None or (isinstance(v, str) and not v.strip()):
            issues.append(f"Required field {f!r} is missing.")
        else:
            present += 1

    for f in optional_fields:
        v = record.get(f)
        if v is not None and not (isinstance(v, str) and not v.strip()):
            present += 1

    score = present / total if total > 0 else 1.0
    return QualityDimension(
        name="completeness",
        score=round(score, 3),
        passed=score >= 0.70,
        issues=issues,
    )


# ---------------------------------------------------------------------------
# Consistency assessment
# ---------------------------------------------------------------------------

def _assess_consistency(record: Dict[str, Any]) -> QualityDimension:
    """
    Check for internal contradictions:
    - start_date < end_date
    - min/max temperature ordering
    - non-negative counts
    """
    issues: List[str] = []

    def _get_float(key: str) -> Optional[float]:
        v = record.get(key)
        try:
            return float(v) if v is not None else None
        except (TypeError, ValueError):
            return None

    # Date ordering
    start = record.get("start_date") or record.get("observed_at")
    end = record.get("end_date")
    if start and end:
        try:
            s = datetime.fromisoformat(str(start).replace("Z", "+00:00"))
            e = datetime.fromisoformat(str(end).replace("Z", "+00:00"))
            if s > e:
                issues.append("start_date is after end_date.")
        except ValueError:
            pass

    # Non-negative counts
    for field_name in [
        "total_deaths", "total_affected", "total_displaced",
        "total_injured", "houses_destroyed",
    ]:
        v = _get_float(field_name)
        if v is not None and v < 0:
            issues.append(f"{field_name} must be ≥ 0, got {v}.")

    # Temperature plausibility
    temp = _get_float("temperature_c")
    feels = _get_float("feels_like_c")
    if temp is not None and feels is not None:
        if abs(temp - feels) > 20:
            issues.append(f"temperature_c ({temp}) and feels_like_c ({feels}) differ by >20°C.")

    score = max(0.0, 1.0 - len(issues) * 0.20)
    return QualityDimension(
        name="consistency",
        score=round(score, 3),
        passed=score >= 0.80,
        issues=issues,
    )


# ---------------------------------------------------------------------------
# Timeliness assessment
# ---------------------------------------------------------------------------

def _assess_timeliness(
    record: Dict[str, Any],
    max_age_seconds: float = 3600.0,
) -> QualityDimension:
    """
    Score how recently the observation was collected.
    Fresh data (< max_age/10) scores 1.0; stale data (> max_age) scores 0.0.
    """
    issues: List[str] = []
    ts_field = (
        record.get("observed_at")
        or record.get("acquired_at")
        or record.get("reported_at")
        or record.get("ingested_at")
    )

    if not ts_field:
        issues.append("No timestamp field found — cannot assess timeliness.")
        return QualityDimension(
            name="timeliness",
            score=0.50,
            passed=False,
            issues=issues,
        )

    try:
        ts = datetime.fromisoformat(str(ts_field).replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        age_s = (now - ts).total_seconds()

        if age_s < 0:
            issues.append(f"Timestamp {ts_field!r} is in the future.")
            score = 0.50
        elif age_s <= max_age_seconds:
            score = max(0.0, 1.0 - (age_s / max_age_seconds) * 0.5)
        else:
            score = max(0.0, 0.50 - ((age_s - max_age_seconds) / (max_age_seconds * 10)) * 0.50)
            issues.append(
                f"Record is {age_s / 3600:.1f} h old — beyond freshness window "
                f"of {max_age_seconds / 3600:.1f} h."
            )
    except ValueError as exc:
        issues.append(f"Cannot parse timestamp {ts_field!r}: {exc}")
        score = 0.40

    return QualityDimension(
        name="timeliness",
        score=round(score, 3),
        passed=score >= 0.60,
        issues=issues,
    )


# ---------------------------------------------------------------------------
# Plausibility assessment
# ---------------------------------------------------------------------------

def _assess_plausibility(record: Dict[str, Any]) -> QualityDimension:
    """
    Detect physically implausible sensor / weather values.
    """
    issues: List[str] = []

    def _chk(key: str, lo: float, hi: float) -> None:
        v = record.get(key)
        if v is None:
            return
        try:
            fv = float(v)
            if not (lo <= fv <= hi):
                issues.append(f"{key}={fv} outside plausible range [{lo}, {hi}].")
        except (TypeError, ValueError):
            pass

    _chk("temperature_c", -60, 60)
    _chk("humidity_pct", 0, 100)
    _chk("pressure_hpa", 850, 1090)
    _chk("wind_speed_ms", 0, 120)
    _chk("wind_direction_deg", 0, 360)
    _chk("rainfall_mm_1h", 0, 600)
    _chk("rainfall_mm_24h", 0, 2000)
    _chk("cloud_cover_pct", 0, 100)
    _chk("battery_pct", 0, 100)
    _chk("latitude", -90, 90)
    _chk("longitude", -180, 180)
    _chk("total_deaths", 0, 10_000_000)
    _chk("total_affected", 0, 2_000_000_000)

    # NaN / Inf checks
    for key, val in record.items():
        if isinstance(val, float):
            if math.isnan(val) or math.isinf(val):
                issues.append(f"Field {key!r} contains NaN or Inf.")

    score = max(0.0, 1.0 - len(issues) * 0.15)
    return QualityDimension(
        name="plausibility",
        score=round(score, 3),
        passed=score >= 0.80,
        issues=issues,
    )


# ---------------------------------------------------------------------------
# Quality assessor class
# ---------------------------------------------------------------------------

class DataQualityAssessor:
    """
    Assess multi-dimensional data quality for records from all ingestion sources.

    Dimensions evaluated:
    - **Completeness**: required and optional field presence rate
    - **Consistency**: internal logical contradictions
    - **Timeliness**: observation freshness relative to pipeline SLA
    - **Plausibility**: physical / domain range violations

    Example::

        assessor = DataQualityAssessor()
        report = assessor.assess(
            record=weather_obs.to_dict(),
            schema_name="weather_observation",
            source="openweathermap",
        )
        print(report.quality_label, report.overall_score)
    """

    _REQUIRED_FIELDS: Dict[str, List[str]] = {
        "weather_observation": [
            "station_id", "latitude", "longitude", "observed_at",
        ],
        "sensor_reading": [
            "sensor_id", "sensor_type", "value", "unit", "observed_at",
        ],
        "citizen_report": [
            "report_id", "latitude", "longitude", "description", "reported_at",
        ],
        "historical_event": [
            "event_id", "disaster_category",
        ],
        "satellite_scene": [
            "scene_id", "acquisition_date",
        ],
    }

    _OPTIONAL_FIELDS: Dict[str, List[str]] = {
        "weather_observation": [
            "temperature_c", "humidity_pct", "pressure_hpa",
            "wind_speed_ms", "rainfall_mm_1h", "rainfall_mm_24h",
        ],
        "sensor_reading": [
            "battery_pct", "signal_strength_dbm", "station_name",
        ],
        "citizen_report": [
            "reporter_name", "region", "image_urls", "landmark",
        ],
        "historical_event": [
            "total_deaths", "total_affected", "latitude", "longitude",
        ],
        "satellite_scene": [
            "cloud_cover_pct", "spatial_resolution_m", "preview_url",
        ],
    }

    def __init__(self, max_age_seconds: float = 3600.0):
        self.max_age_seconds = max_age_seconds

    def assess(
        self,
        record: Dict[str, Any],
        schema_name: str = "generic",
        source: str = "unknown",
        record_id: Optional[str] = None,
    ) -> QualityReport:
        """Assess quality of a single record across all four dimensions."""
        rid = record_id or str(
            record.get("sensor_id")
            or record.get("report_id")
            or record.get("scene_id")
            or record.get("event_id")
            or "unknown"
        )

        required = self._REQUIRED_FIELDS.get(schema_name, [])
        optional = self._OPTIONAL_FIELDS.get(schema_name, [])

        dims = [
            _assess_completeness(record, required, optional),
            _assess_consistency(record),
            _assess_timeliness(record, self.max_age_seconds),
            _assess_plausibility(record),
        ]

        # Dimension weights: completeness 35%, consistency 25%, timeliness 20%, plausibility 20%
        weights = [0.35, 0.25, 0.20, 0.20]
        overall = sum(d.score * w for d, w in zip(dims, weights))

        recommendations = self._build_recommendations(dims)
        label = _quality_label(overall)

        return QualityReport(
            record_id=rid,
            source=source,
            overall_score=round(overall, 3),
            quality_label=label,
            dimensions=dims,
            recommendations=recommendations,
            assessed_at=datetime.now(timezone.utc).isoformat(),
        )

    def assess_batch(
        self,
        records: List[Dict[str, Any]],
        schema_name: str = "generic",
        source: str = "unknown",
    ) -> tuple[List[QualityReport], BatchQualitySummary]:
        """Assess a batch and return individual reports plus aggregate summary."""
        reports = [
            self.assess(r, schema_name=schema_name, source=source)
            for r in records
        ]
        return reports, self._summarise(reports)

    @staticmethod
    def _build_recommendations(dims: List[QualityDimension]) -> List[str]:
        recs: List[str] = []
        for d in dims:
            if not d.passed:
                if d.name == "completeness":
                    recs.append("Fill in missing required fields before ingestion.")
                elif d.name == "consistency":
                    recs.append("Review and correct internal field contradictions.")
                elif d.name == "timeliness":
                    recs.append(
                        "Check sensor clock sync and data pipeline latency; "
                        "consider increasing polling frequency."
                    )
                elif d.name == "plausibility":
                    recs.append(
                        "Inspect sensor calibration — reported values fall outside "
                        "physically plausible ranges."
                    )
        return recs

    @staticmethod
    def _summarise(reports: List[QualityReport]) -> BatchQualitySummary:
        total = len(reports)
        if total == 0:
            return BatchQualitySummary(
                total_records=0, excellent=0, good=0, acceptable=0,
                poor=0, reject=0, mean_overall_score=0.0, quarantine_rate_pct=0.0,
            )
        labels = {r.quality_label for r in reports}
        scores = [r.overall_score for r in reports]
        mean_score = sum(scores) / total
        quarantine = sum(1 for r in reports if r.overall_score < 0.60)

        return BatchQualitySummary(
            total_records=total,
            excellent=sum(1 for r in reports if r.quality_label == "excellent"),
            good=sum(1 for r in reports if r.quality_label == "good"),
            acceptable=sum(1 for r in reports if r.quality_label == "acceptable"),
            poor=sum(1 for r in reports if r.quality_label == "poor"),
            reject=sum(1 for r in reports if r.quality_label == "reject"),
            mean_overall_score=round(mean_score, 3),
            quarantine_rate_pct=round(quarantine / total * 100, 2),
        )
