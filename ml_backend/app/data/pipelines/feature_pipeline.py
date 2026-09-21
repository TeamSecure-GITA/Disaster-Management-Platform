"""
Feature pipeline.

Transforms preprocessed records into domain-specific ML feature vectors
and commits them to the feature store.

This is the final stage of the data pipeline before model serving:

    Raw data → Ingest → Validate → Preprocess → Feature engineering → Feature store → Model

Feature groups computed:
- **weather_features**: meteorological signals for flood/cyclone risk models
- **sensor_features**: water-level, seismic, soil-moisture with anomaly flags
- **flood_risk_features**: composite flood-risk indicator per region
- **landslide_features**: terrain + soil + rainfall composite
- **population_exposure_features**: population at risk per region
- **operational_features**: resource availability, unit positions
"""

from __future__ import annotations

import math
import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from ..feature_store import FeatureStore, FeatureVector, FeatureVersionManager
from .preprocessing_pipeline import ProcessedRecord


logger = logging.getLogger("disaster-management.data.pipelines.feature")


# ---------------------------------------------------------------------------
# Feature vector outputs
# ---------------------------------------------------------------------------

@dataclass
class FeaturePipelineResult:
    """Summary of a feature pipeline run."""

    run_id: str
    records_in: int
    feature_vectors_produced: int
    feature_groups_updated: List[str]
    elapsed_ms: float
    success: bool
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Domain feature engineers
# ---------------------------------------------------------------------------

class WeatherFeatureEngineer:
    """
    Compute derived weather features for flood, cyclone, and heat-wave models.
    """

    def compute(self, record: ProcessedRecord) -> Dict[str, Any]:
        raw = record.raw_features
        feats: Dict[str, Any] = {}

        rain_1h = self._f(raw.get("rainfall_mm_1h"), 0.0)
        rain_24h = self._f(raw.get("rainfall_mm_24h"), 0.0)
        wind_ms = self._f(raw.get("wind_speed_ms"), 0.0)
        temp = self._f(raw.get("temperature_c"))
        humidity = self._f(raw.get("humidity_pct"), 0.0)

        # Derived indicators
        feats["is_heavy_rain"] = int(rain_1h >= 15.0)
        feats["is_extreme_rain"] = int(rain_24h >= 64.5)   # NDMA heavy-rain threshold
        feats["is_cyclone_wind"] = int(wind_ms >= 17.2)    # Beaufort 8+
        feats["rain_intensity_category"] = self._rain_category(rain_1h)

        if temp is not None and humidity is not None:
            feats["wet_bulb_approx_c"] = round(
                temp * math.atan(0.151977 * math.sqrt(humidity + 8.313659))
                + math.atan(temp + humidity)
                - math.atan(humidity - 1.676331)
                + 0.00391838 * humidity ** 1.5 * math.atan(0.023101 * humidity)
                - 4.686035,
                2,
            )
            feats["is_heat_stress"] = int(feats.get("wet_bulb_approx_c", 0) >= 30)

        feats["composite_weather_risk"] = round(
            min(1.0, (rain_24h / 200.0) * 0.5 + (wind_ms / 60.0) * 0.5), 3
        )

        return feats

    @staticmethod
    def _rain_category(mm_1h: float) -> int:
        """IMD hourly rainfall classification: 0=nil, 1=light, 2=moderate, 3=heavy, 4=very heavy"""
        if mm_1h < 2.5:
            return 0
        if mm_1h < 7.5:
            return 1
        if mm_1h < 15.5:
            return 2
        if mm_1h < 64.5:
            return 3
        return 4

    @staticmethod
    def _f(v: Any, default: Optional[float] = None) -> Optional[float]:
        try:
            return float(v) if v is not None else default
        except (TypeError, ValueError):
            return default


class SensorFeatureEngineer:
    """
    Compute anomaly scores and trend features for sensor readings.
    Maintains a rolling window of recent values per sensor for Z-score calculation.
    """

    def __init__(self, window_size: int = 12):
        self.window_size = window_size
        self._windows: Dict[str, List[float]] = {}

    def compute(self, record: ProcessedRecord) -> Dict[str, Any]:
        raw = record.raw_features
        sensor_id = raw.get("sensor_id", "unknown")
        value = self._f(raw.get("value"), 0.0)
        feats: Dict[str, Any] = {}

        # Update rolling window
        window = self._windows.setdefault(sensor_id, [])
        window.append(value)
        if len(window) > self.window_size:
            window.pop(0)

        # Z-score anomaly
        if len(window) >= 3:
            mean = sum(window) / len(window)
            std = math.sqrt(sum((x - mean) ** 2 for x in window) / len(window)) or 1.0
            z_score = (value - mean) / std
            feats["z_score"] = round(z_score, 4)
            feats["is_anomaly"] = int(abs(z_score) >= 2.5)
        else:
            feats["z_score"] = 0.0
            feats["is_anomaly"] = 0

        # Trend (rate of change over last 2 readings)
        if len(window) >= 2:
            feats["delta"] = round(window[-1] - window[-2], 4)
            feats["trend_label"] = (
                "rising" if feats["delta"] > 0.1 else
                "falling" if feats["delta"] < -0.1 else
                "stable"
            )
        else:
            feats["delta"] = 0.0
            feats["trend_label"] = "stable"

        feats["alert_triggered"] = int(bool(raw.get("alert_triggered")))
        return feats

    @staticmethod
    def _f(v: Any, default: float = 0.0) -> float:
        try:
            return float(v) if v is not None else default
        except (TypeError, ValueError):
            return default


class FloodRiskFeatureEngineer:
    """
    Compute composite flood-risk feature vectors from multiple source records.
    Called with a dict of aggregated signals for a region.
    """

    def compute(self, aggregated: Dict[str, Any]) -> Dict[str, Any]:
        rain_24h = float(aggregated.get("rainfall_mm_24h", 0))
        water_level_m = float(aggregated.get("water_level_m", 0))
        water_level_trend = aggregated.get("water_level_trend", "stable")
        soil_saturation = float(aggregated.get("soil_moisture_pct", 50))
        population_density = float(aggregated.get("population_density", 0))
        elevation_m = float(aggregated.get("elevation_m", 100))

        # Sub-scores (0 – 1)
        rain_score = min(1.0, rain_24h / 200.0)
        water_score = min(1.0, water_level_m / 10.0)
        soil_score = min(1.0, soil_saturation / 100.0)
        elevation_score = max(0.0, 1.0 - elevation_m / 200.0)   # Lower elevation = higher risk
        trend_bonus = 0.15 if water_level_trend == "rising" else 0.0

        composite = min(1.0,
            rain_score * 0.35
            + water_score * 0.30
            + soil_score * 0.15
            + elevation_score * 0.10
            + trend_bonus * 0.10
        )

        exposure = min(1.0, population_density / 5000.0)

        return {
            "rain_score": round(rain_score, 3),
            "water_level_score": round(water_score, 3),
            "soil_score": round(soil_score, 3),
            "elevation_score": round(elevation_score, 3),
            "composite_flood_risk": round(composite, 3),
            "population_exposure": round(exposure, 3),
            "flood_risk_label": _risk_label(composite),
        }


def _risk_label(score: float) -> str:
    if score >= 0.80:
        return "critical"
    if score >= 0.60:
        return "high"
    if score >= 0.40:
        return "medium"
    if score >= 0.20:
        return "low"
    return "minimal"


# ---------------------------------------------------------------------------
# Feature pipeline orchestrator
# ---------------------------------------------------------------------------

class FeaturePipeline:
    """
    Orchestrate feature engineering for all processed records and commit
    resulting feature vectors to the feature store with version tracking.

    Example::

        pipeline = FeaturePipeline(
            feature_store=my_store,
            version_manager=my_version_manager,
        )
        result = pipeline.run(processed_records, schema_name="weather_observation")
    """

    def __init__(
        self,
        feature_store: FeatureStore | None = None,
        version_manager: FeatureVersionManager | None = None,
        ttl_seconds: float = 3600.0,
    ):
        self.feature_store = feature_store or FeatureStore()
        self.version_manager = version_manager or FeatureVersionManager()
        self.ttl_seconds = ttl_seconds

        self._weather_eng = WeatherFeatureEngineer()
        self._sensor_eng = SensorFeatureEngineer()
        self._flood_eng = FloodRiskFeatureEngineer()

    def run(
        self,
        processed_records: List[ProcessedRecord],
        schema_name: str = "generic",
        pipeline_run_id: Optional[str] = None,
    ) -> FeaturePipelineResult:
        """
        Compute and store feature vectors for a batch of processed records.
        """
        import uuid
        import time

        run_id = pipeline_run_id or f"fpipe-{uuid.uuid4().hex[:8]}"
        t0 = time.monotonic()
        vectors_produced = 0
        groups_updated: set = set()

        try:
            for pr in processed_records:
                vectors = self._engineer(pr, schema_name)
                for vec in vectors:
                    self.feature_store.put(vec)
                    self.version_manager.commit(
                        entity_id=vec.entity_id,
                        feature_group=vec.feature_group,
                        features=vec.features,
                        pipeline_run_id=run_id,
                    )
                    groups_updated.add(vec.feature_group)
                    vectors_produced += 1

            return FeaturePipelineResult(
                run_id=run_id,
                records_in=len(processed_records),
                feature_vectors_produced=vectors_produced,
                feature_groups_updated=sorted(groups_updated),
                elapsed_ms=round((time.monotonic() - t0) * 1000, 2),
                success=True,
            )
        except Exception as exc:
            logger.exception("Feature pipeline error: %s", exc)
            return FeaturePipelineResult(
                run_id=run_id,
                records_in=len(processed_records),
                feature_vectors_produced=vectors_produced,
                feature_groups_updated=sorted(groups_updated),
                elapsed_ms=round((time.monotonic() - t0) * 1000, 2),
                success=False,
                error=str(exc),
            )

    def _engineer(
        self,
        pr: ProcessedRecord,
        schema_name: str,
    ) -> List[FeatureVector]:
        entity_id = pr.record_id
        vectors: List[FeatureVector] = []

        if schema_name == "weather_observation":
            derived = self._weather_eng.compute(pr)
            all_feats = {**pr.clean_features, **pr.temporal_features, **derived}
            vectors.append(FeatureVector(
                entity_id=entity_id,
                feature_group="weather_features",
                version="latest",
                features=all_feats,
                ttl_seconds=self.ttl_seconds,
            ))

        elif schema_name == "sensor_reading":
            derived = self._sensor_eng.compute(pr)
            all_feats = {**pr.clean_features, **pr.temporal_features, **derived}
            vectors.append(FeatureVector(
                entity_id=entity_id,
                feature_group="sensor_features",
                version="latest",
                features=all_feats,
                ttl_seconds=600.0,
            ))

        else:
            # Generic: store clean + temporal features as-is
            all_feats = {**pr.clean_features, **pr.temporal_features}
            if all_feats:
                vectors.append(FeatureVector(
                    entity_id=entity_id,
                    feature_group=f"{schema_name}_features",
                    version="latest",
                    features=all_feats,
                    ttl_seconds=self.ttl_seconds,
                ))

        return vectors

    def compute_flood_risk_features(
        self,
        region_id: str,
        aggregated: Dict[str, Any],
        pipeline_run_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Compute and store flood risk feature vector for a specific region.
        Returns the computed feature dict.
        """
        feats = self._flood_eng.compute(aggregated)
        vec = FeatureVector(
            entity_id=f"region-{region_id}",
            feature_group="flood_risk_features",
            version="latest",
            features=feats,
            ttl_seconds=1800.0,
        )
        self.feature_store.put(vec)
        self.version_manager.commit(
            entity_id=vec.entity_id,
            feature_group=vec.feature_group,
            features=feats,
            pipeline_run_id=pipeline_run_id,
        )
        return feats
