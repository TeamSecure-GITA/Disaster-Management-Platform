"""
Ingestion pipeline.

Orchestrates the end-to-end ingest cycle for all data sources:
fetch → validate (schema + quality + dedup) → persist to feature store.

Designed as an idempotent, re-runnable pipeline that can be triggered:
- On a fixed schedule (every 5 minutes for sensors, every hour for weather)
- On demand from the REST API
- Via a webhook push from upstream data providers

Returns a structured ``IngestionRunResult`` with per-source statistics
and quality metrics for monitoring dashboards.
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from ..ingestion import (
    CitizenReportIngester,
    DataIngestionService,
    DroneIngester,
    HistoricalIngester,
    SatelliteIngester,
    SensorIngester,
    WeatherIngester,
)
from ..validation import ValidationService
from ..feature_store import FeatureStore, FeatureVector


logger = logging.getLogger("disaster-management.data.pipelines.ingestion")


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class SourceRunStats:
    """Statistics for a single source ingestion run."""

    source_name: str
    records_fetched: int = 0
    records_valid: int = 0
    records_invalid: int = 0
    records_duplicate: int = 0
    records_stored: int = 0
    mean_quality_score: float = 0.0
    errors: List[str] = field(default_factory=list)
    elapsed_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class IngestionRunResult:
    """Result of a complete ingestion pipeline run across all sources."""

    run_id: str
    started_at: str
    completed_at: str
    success: bool
    total_records_fetched: int
    total_records_stored: int
    total_records_rejected: int
    sources: List[SourceRunStats]
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            "sources": [s.to_dict() for s in self.sources],
        }


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

class IngestionPipeline:
    """
    End-to-end data ingestion pipeline.

    Coordinates all ingesters with validation and storage.
    Each source can be enabled/disabled independently.

    Example::

        pipeline = IngestionPipeline(
            ingestion=DataIngestionService(),
            validation=ValidationService(),
            feature_store=FeatureStore(),
        )
        result = pipeline.run(sources=["weather", "sensors"])
        print(result.total_records_stored, "records stored")
    """

    def __init__(
        self,
        ingestion: DataIngestionService | None = None,
        validation: ValidationService | None = None,
        feature_store: FeatureStore | None = None,
        weather_stations: Optional[List[Dict[str, Any]]] = None,
        sensor_payloads: Optional[List[Dict[str, Any]]] = None,
    ):
        self.ingestion = ingestion or DataIngestionService()
        self.validation = validation or ValidationService()
        self.feature_store = feature_store or FeatureStore()

        # Default station lists (override for production)
        self._weather_stations = weather_stations or []
        self._sensor_payloads = sensor_payloads or []

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def run(
        self,
        sources: Optional[List[str]] = None,
        run_id: Optional[str] = None,
    ) -> IngestionRunResult:
        """
        Execute a full or partial ingestion run.

        ``sources`` can include any of: weather, sensors, satellite, drone,
        citizen_reports, historical.  Defaults to all sources.
        """
        import uuid
        import time

        run_id = run_id or f"run-{uuid.uuid4().hex[:8]}"
        enabled = set(sources) if sources else {
            "weather", "sensors", "satellite", "drone", "citizen_reports",
        }
        started_at = datetime.now(timezone.utc).isoformat()
        t0 = time.monotonic()

        logger.info("Ingestion run %s started. Sources: %s", run_id, enabled)

        source_stats: List[SourceRunStats] = []
        overall_error: Optional[str] = None

        try:
            if "weather" in enabled:
                source_stats.append(self._run_weather())
            if "sensors" in enabled:
                source_stats.append(self._run_sensors())
            if "satellite" in enabled:
                source_stats.append(self._run_satellite())
            if "drone" in enabled:
                source_stats.append(self._run_drone())
            if "citizen_reports" in enabled:
                source_stats.append(self._run_citizen_reports())
        except Exception as exc:
            logger.exception("Ingestion pipeline fatal error: %s", exc)
            overall_error = str(exc)

        completed_at = datetime.now(timezone.utc).isoformat()
        elapsed = (time.monotonic() - t0) * 1000.0

        total_fetched = sum(s.records_fetched for s in source_stats)
        total_stored = sum(s.records_stored for s in source_stats)
        total_rejected = sum(s.records_invalid + s.records_duplicate for s in source_stats)

        result = IngestionRunResult(
            run_id=run_id,
            started_at=started_at,
            completed_at=completed_at,
            success=overall_error is None,
            total_records_fetched=total_fetched,
            total_records_stored=total_stored,
            total_records_rejected=total_rejected,
            sources=source_stats,
            error=overall_error,
        )
        logger.info(
            "Ingestion run %s complete: %d stored, %d rejected. %.1f ms",
            run_id, total_stored, total_rejected, elapsed,
        )
        return result

    # ------------------------------------------------------------------
    # Per-source runners
    # ------------------------------------------------------------------

    def _run_weather(self) -> SourceRunStats:
        import time
        stats = SourceRunStats(source_name="weather")
        t0 = time.monotonic()
        try:
            stations = self._weather_stations or [
                {"lat": 26.1158, "lon": 91.7086, "station_id": "guwahati"},
                {"lat": 22.5726, "lon": 88.3639, "station_id": "kolkata"},
            ]
            observations = self.ingestion.weather.fetch_batch(stations)
            stats.records_fetched = len(observations)

            quality_scores = []
            for obs in observations:
                rec = obs.to_dict()
                v = self.validation.validate_and_assess(rec, "weather_observation", source="weather")
                if v["is_duplicate"]:
                    stats.records_duplicate += 1
                    continue
                if not v["schema_valid"] or v["quality_label"] == "reject":
                    stats.records_invalid += 1
                    continue
                quality_scores.append(v["quality_score"])
                self.feature_store.put(FeatureVector(
                    entity_id=f"station-{obs.station_id}",
                    feature_group="weather_features",
                    version="latest",
                    features={
                        k: v for k, v in rec.items()
                        if k not in ("raw", "source", "station_id")
                    },
                    ttl_seconds=3600.0,
                ))
                stats.records_stored += 1

            stats.records_valid = stats.records_stored
            stats.mean_quality_score = (
                sum(quality_scores) / len(quality_scores) if quality_scores else 0.0
            )
        except Exception as exc:
            logger.warning("Weather ingestion error: %s", exc)
            stats.errors.append(str(exc))
        finally:
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
        return stats

    def _run_sensors(self) -> SourceRunStats:
        import time
        stats = SourceRunStats(source_name="sensors")
        t0 = time.monotonic()
        try:
            payloads = self._sensor_payloads
            if not payloads:
                logger.debug("No sensor payloads configured for ingestion run.")
                return stats

            readings = self.ingestion.sensors.ingest_batch(payloads)
            stats.records_fetched = len(readings)

            for reading in readings:
                rec = reading.to_dict()
                v = self.validation.validate_and_assess(rec, "sensor_reading", source="sensor")
                if v["is_duplicate"]:
                    stats.records_duplicate += 1
                    continue
                if not v["schema_valid"] or v["quality_label"] == "reject":
                    stats.records_invalid += 1
                    continue
                self.feature_store.put(FeatureVector(
                    entity_id=f"sensor-{reading.sensor_id}",
                    feature_group="sensor_features",
                    version="latest",
                    features={
                        "value": reading.value,
                        "unit": reading.unit,
                        "sensor_type": reading.sensor_type.value,
                        "alert_triggered": reading.alert_triggered,
                        "observed_at": reading.observed_at,
                    },
                    ttl_seconds=600.0,
                ))
                stats.records_stored += 1

            stats.records_valid = stats.records_stored
        except Exception as exc:
            logger.warning("Sensor ingestion error: %s", exc)
            stats.errors.append(str(exc))
        finally:
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
        return stats

    def _run_satellite(self) -> SourceRunStats:
        # Satellite metadata is pulled on demand by the satellite ingester
        # when configured; return empty stats when not configured
        import time
        stats = SourceRunStats(source_name="satellite")
        t0 = time.monotonic()
        if not self.ingestion.satellite.stac_api_url:
            logger.debug("Satellite STAC API not configured — skipping.")
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
            return stats

        try:
            # Placeholder — real runs provide bbox + date range from config
            stats.records_fetched = 0
        except Exception as exc:
            stats.errors.append(str(exc))
        finally:
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
        return stats

    def _run_drone(self) -> SourceRunStats:
        import time
        stats = SourceRunStats(source_name="drone")
        t0 = time.monotonic()
        try:
            fleet = self.ingestion.drone.get_live_fleet()
            stats.records_fetched = len(fleet)
            for tel in fleet:
                self.feature_store.put(FeatureVector(
                    entity_id=f"drone-{tel.drone_id}",
                    feature_group="drone_telemetry",
                    version="latest",
                    features={
                        "latitude": tel.latitude,
                        "longitude": tel.longitude,
                        "altitude_m": tel.altitude_m,
                        "battery_pct": tel.battery_pct,
                        "status": tel.status.value,
                    },
                    ttl_seconds=60.0,
                ))
                stats.records_stored += 1
            stats.records_valid = stats.records_stored
        except Exception as exc:
            stats.errors.append(str(exc))
        finally:
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
        return stats

    def _run_citizen_reports(self) -> SourceRunStats:
        import time
        stats = SourceRunStats(source_name="citizen_reports")
        t0 = time.monotonic()
        try:
            pending = self.ingestion.citizen_reports.get_pending()
            stats.records_fetched = len(pending)
            for report in pending:
                rec = report.to_dict()
                v = self.validation.validate_and_assess(rec, "citizen_report", source="citizen")
                if v["is_duplicate"]:
                    stats.records_duplicate += 1
                    continue
                if v["quality_label"] == "reject":
                    stats.records_invalid += 1
                    continue
                self.feature_store.put(FeatureVector(
                    entity_id=f"report-{report.report_id}",
                    feature_group="citizen_report_features",
                    version="latest",
                    features={
                        "latitude": report.latitude,
                        "longitude": report.longitude,
                        "report_type": report.report_type.value,
                        "urgency": report.urgency.value,
                        "credibility_score": report.credibility_score,
                    },
                    ttl_seconds=86400.0,
                ))
                stats.records_stored += 1
            stats.records_valid = stats.records_stored
        except Exception as exc:
            stats.errors.append(str(exc))
        finally:
            stats.elapsed_ms = (time.monotonic() - t0) * 1000.0
        return stats
