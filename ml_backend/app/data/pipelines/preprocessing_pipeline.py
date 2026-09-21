"""
Preprocessing pipeline.

Transforms raw, validated ingested records into clean, ML-ready feature
representations through:

1. **Normalisation**: scale continuous features to [0, 1] or Z-scores.
2. **Categorical encoding**: map enum strings to one-hot or ordinal integers.
3. **Outlier handling**: IQR and Z-score capping.
4. **Missing value imputation**: mean/median/constant fill strategies.
5. **Temporal enrichment**: extract hour-of-day, day-of-week, season from timestamps.

Produces ``ProcessedRecord`` objects that feed directly into the feature
pipeline for feature vector computation.
"""

from __future__ import annotations

import math
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional


logger = logging.getLogger("disaster-management.data.pipelines.preprocessing")


# ---------------------------------------------------------------------------
# Output type
# ---------------------------------------------------------------------------

@dataclass
class ProcessedRecord:
    """A record that has been cleaned, normalised, and enriched."""

    record_id: str
    source: str
    schema_name: str
    raw_features: Dict[str, Any]
    clean_features: Dict[str, Any]
    temporal_features: Dict[str, Any]
    processing_steps: List[str]
    processed_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    quality_score: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @property
    def all_features(self) -> Dict[str, Any]:
        """Merge all feature dicts into one flat dict."""
        return {**self.raw_features, **self.clean_features, **self.temporal_features}


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

class ImputationStrategy(str, Enum):
    MEAN = "mean"
    MEDIAN = "median"
    ZERO = "zero"
    CONSTANT = "constant"
    FORWARD_FILL = "forward_fill"     # Requires time-ordered batch


class NormalisationStrategy(str, Enum):
    MIN_MAX = "min_max"
    Z_SCORE = "z_score"
    NONE = "none"


@dataclass
class ColumnSpec:
    """Processing specification for one feature column."""

    column: str
    imputation: ImputationStrategy = ImputationStrategy.MEAN
    imputation_constant: Optional[float] = None
    normalise: NormalisationStrategy = NormalisationStrategy.NONE
    clip_min: Optional[float] = None
    clip_max: Optional[float] = None


# ---------------------------------------------------------------------------
# Per-schema preprocessing specs
# ---------------------------------------------------------------------------

_WEATHER_SPECS: List[ColumnSpec] = [
    ColumnSpec("temperature_c",   ImputationStrategy.MEAN,   normalise=NormalisationStrategy.Z_SCORE, clip_min=-60, clip_max=60),
    ColumnSpec("humidity_pct",    ImputationStrategy.MEDIAN, normalise=NormalisationStrategy.MIN_MAX,  clip_min=0,   clip_max=100),
    ColumnSpec("pressure_hpa",    ImputationStrategy.MEAN,   normalise=NormalisationStrategy.MIN_MAX,  clip_min=850, clip_max=1090),
    ColumnSpec("wind_speed_ms",   ImputationStrategy.ZERO,   normalise=NormalisationStrategy.MIN_MAX,  clip_min=0,   clip_max=120),
    ColumnSpec("rainfall_mm_1h",  ImputationStrategy.ZERO,   normalise=NormalisationStrategy.MIN_MAX,  clip_min=0,   clip_max=200),
    ColumnSpec("rainfall_mm_24h", ImputationStrategy.ZERO,   normalise=NormalisationStrategy.MIN_MAX,  clip_min=0,   clip_max=1000),
]

_SENSOR_SPECS: List[ColumnSpec] = [
    ColumnSpec("value",       ImputationStrategy.MEDIAN, normalise=NormalisationStrategy.Z_SCORE),
    ColumnSpec("battery_pct", ImputationStrategy.CONSTANT, imputation_constant=100.0, clip_min=0, clip_max=100),
]

_SCHEMA_SPECS: Dict[str, List[ColumnSpec]] = {
    "weather_observation": _WEATHER_SPECS,
    "sensor_reading": _SENSOR_SPECS,
}


# ---------------------------------------------------------------------------
# Statistic computation helpers
# ---------------------------------------------------------------------------

def _compute_stats(values: List[float]) -> Dict[str, float]:
    """Compute mean, std, min, max, median for a list of floats."""
    n = len(values)
    if n == 0:
        return {"mean": 0.0, "std": 1.0, "min": 0.0, "max": 1.0, "median": 0.0}
    mean = sum(values) / n
    variance = sum((x - mean) ** 2 for x in values) / n
    std = math.sqrt(variance) or 1.0
    sorted_vals = sorted(values)
    if n % 2 == 0:
        median = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2
    else:
        median = sorted_vals[n // 2]
    return {"mean": mean, "std": std, "min": sorted_vals[0], "max": sorted_vals[-1], "median": median}


# ---------------------------------------------------------------------------
# Temporal feature extraction
# ---------------------------------------------------------------------------

def _extract_temporal(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract calendar and cyclical temporal features from the record timestamp.
    Returns an empty dict if no parseable timestamp is found.
    """
    ts_field = (
        record.get("observed_at")
        or record.get("reported_at")
        or record.get("acquisition_date")
        or record.get("ingested_at")
    )
    if not ts_field:
        return {}
    try:
        ts = datetime.fromisoformat(str(ts_field).replace("Z", "+00:00"))
        hour = ts.hour
        dow = ts.weekday()      # 0=Monday
        month = ts.month
        season = _month_to_season(month)

        return {
            "hour_of_day": hour,
            "day_of_week": dow,
            "month": month,
            "season": season,
            "is_night": int(hour < 6 or hour >= 20),
            "is_weekend": int(dow >= 5),
            # Cyclical encodings (prevents jump at midnight / year boundary)
            "hour_sin": round(math.sin(2 * math.pi * hour / 24), 6),
            "hour_cos": round(math.cos(2 * math.pi * hour / 24), 6),
            "month_sin": round(math.sin(2 * math.pi * month / 12), 6),
            "month_cos": round(math.cos(2 * math.pi * month / 12), 6),
        }
    except (ValueError, AttributeError):
        return {}


def _month_to_season(month: int) -> str:
    """Map calendar month to Indian meteorological season."""
    if month in (12, 1, 2):
        return "winter"
    if month in (3, 4, 5):
        return "pre_monsoon"
    if month in (6, 7, 8, 9):
        return "monsoon"
    return "post_monsoon"


# ---------------------------------------------------------------------------
# Main preprocessor
# ---------------------------------------------------------------------------

class PreprocessingPipeline:
    """
    Transform validated records into clean, ML-ready feature representations.

    For batch processing, fit statistics are computed from the batch itself
    (streaming mode) or supplied externally (production mode with persisted stats).

    Example::

        pipeline = PreprocessingPipeline()
        records = [obs.to_dict() for obs in weather_observations]
        processed = pipeline.process_batch(records, schema_name="weather_observation")
        for pr in processed:
            print(pr.all_features)
    """

    def __init__(self, external_stats: Optional[Dict[str, Dict[str, float]]] = None):
        """
        Args:
            external_stats: Pre-computed column statistics
                {column_name -> {mean, std, min, max, median}}.
                If None, statistics are computed from each batch.
        """
        self._external_stats = external_stats or {}

    def process_batch(
        self,
        records: List[Dict[str, Any]],
        schema_name: str = "generic",
        source: str = "unknown",
    ) -> List[ProcessedRecord]:
        """Process a batch of validated raw record dicts."""
        specs = _SCHEMA_SPECS.get(schema_name, [])
        col_stats = self._compute_batch_stats(records, specs)

        processed = []
        for r in records:
            pr = self._process_single(r, schema_name, source, specs, col_stats)
            processed.append(pr)
        return processed

    def process_single(
        self,
        record: Dict[str, Any],
        schema_name: str = "generic",
        source: str = "unknown",
    ) -> ProcessedRecord:
        specs = _SCHEMA_SPECS.get(schema_name, [])
        # For single records, use external stats or skip normalisation
        col_stats: Dict[str, Dict[str, float]] = {**self._external_stats}
        return self._process_single(record, schema_name, source, specs, col_stats)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _process_single(
        self,
        record: Dict[str, Any],
        schema_name: str,
        source: str,
        specs: List[ColumnSpec],
        col_stats: Dict[str, Dict[str, float]],
    ) -> ProcessedRecord:
        clean: Dict[str, Any] = {}
        steps: List[str] = []

        for spec in specs:
            raw_val = record.get(spec.column)
            val = self._impute(raw_val, spec, col_stats)

            if val is None:
                continue

            # Clip
            if spec.clip_min is not None:
                val = max(spec.clip_min, val)
            if spec.clip_max is not None:
                val = min(spec.clip_max, val)

            # Normalise
            stats = col_stats.get(spec.column, {})
            norm_val = self._normalise(val, spec, stats)
            clean[spec.column] = round(norm_val, 6)

        if clean:
            steps.append("normalise")

        # Categorical → integer encoding
        for key, val in record.items():
            if isinstance(val, str) and key not in clean:
                # Try ordinal integer for known enums
                encoded = self._encode_categorical(key, val)
                if encoded is not None:
                    clean[f"{key}_enc"] = encoded
                    steps.append(f"encode:{key}")

        # Temporal enrichment
        temporal = _extract_temporal(record)
        if temporal:
            steps.append("temporal_enrichment")

        record_id = self._extract_id(record)

        return ProcessedRecord(
            record_id=record_id,
            source=source,
            schema_name=schema_name,
            raw_features={
                k: v for k, v in record.items()
                if k not in ("raw",)
            },
            clean_features=clean,
            temporal_features=temporal,
            processing_steps=steps,
        )

    @staticmethod
    def _impute(
        value: Any,
        spec: ColumnSpec,
        stats: Dict[str, Dict[str, float]],
    ) -> Optional[float]:
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                pass

        col_stat = stats.get(spec.column, {})
        if spec.imputation == ImputationStrategy.MEAN:
            return col_stat.get("mean", 0.0)
        if spec.imputation == ImputationStrategy.MEDIAN:
            return col_stat.get("median", 0.0)
        if spec.imputation == ImputationStrategy.ZERO:
            return 0.0
        if spec.imputation == ImputationStrategy.CONSTANT:
            return spec.imputation_constant or 0.0
        return None

    @staticmethod
    def _normalise(
        value: float,
        spec: ColumnSpec,
        stats: Dict[str, float],
    ) -> float:
        if spec.normalise == NormalisationStrategy.MIN_MAX:
            lo = stats.get("min", 0.0)
            hi = stats.get("max", 1.0)
            denom = hi - lo
            if denom == 0:
                return 0.0
            return (value - lo) / denom
        if spec.normalise == NormalisationStrategy.Z_SCORE:
            mean = stats.get("mean", 0.0)
            std = stats.get("std", 1.0) or 1.0
            return (value - mean) / std
        return value

    @staticmethod
    def _compute_batch_stats(
        records: List[Dict[str, Any]],
        specs: List[ColumnSpec],
    ) -> Dict[str, Dict[str, float]]:
        stats: Dict[str, Dict[str, float]] = {}
        for spec in specs:
            values = []
            for r in records:
                v = r.get(spec.column)
                if v is not None:
                    try:
                        values.append(float(v))
                    except (TypeError, ValueError):
                        pass
            if values:
                stats[spec.column] = _compute_stats(values)
        return stats

    @staticmethod
    def _encode_categorical(key: str, val: str) -> Optional[int]:
        """Simple ordinal encoding for known categorical fields."""
        _MAPS: Dict[str, Dict[str, int]] = {
            "urgency": {"low": 0, "medium": 1, "high": 2, "life_threatening": 3},
            "sensor_status": {"offline": 0, "degraded": 1, "calibrating": 1, "online": 2, "unknown": -1},
            "report_type": {},
        }
        mapping = _MAPS.get(key)
        if mapping is None:
            return None
        return mapping.get(val.lower())

    @staticmethod
    def _extract_id(record: Dict[str, Any]) -> str:
        for key in ["sensor_id", "report_id", "scene_id", "event_id", "station_id", "id"]:
            v = record.get(key)
            if v:
                return str(v)
        return "unknown"
