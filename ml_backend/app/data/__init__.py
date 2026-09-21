"""
Data sub-system for the Disaster Management Platform ML backend.

Provides a unified ``DataService`` entry-point that aggregates ingestion,
validation, feature store, and pipeline services.

Sub-packages
------------
- ``ingestion``    — weather, sensors, satellite, drone, citizen reports, historical
- ``validation``   — schema validation, quality assessment, deduplication
- ``feature_store`` — versioned feature store, registry, and snapshot management
- ``pipelines``    — ingestion, preprocessing, and feature engineering pipelines

Quick start
-----------
::

    from app.data import DataService

    svc = DataService()

    # Ingest weather for a station
    obs = svc.ingestion.weather.fetch(lat=26.1, lon=91.7)

    # Validate it
    result = svc.validation.validate_and_assess(
        obs.to_dict(), "weather_observation", source="openweathermap"
    )

    # Run the full ingestion pipeline
    run_result = svc.pipelines.ingestion.run(["weather", "sensors"])
"""

from __future__ import annotations

from .feature_store import FeatureStoreService
from .ingestion import DataIngestionService
from .pipelines import PipelineService
from .validation import ValidationService


class DataService:
    """
    Top-level data subsystem facade.

    Composes all data sub-services into one cohesive unit. Components
    share a common feature store and validation service by default.
    """

    def __init__(
        self,
        ingestion: DataIngestionService | None = None,
        validation: ValidationService | None = None,
        feature_store: FeatureStoreService | None = None,
        pipelines: PipelineService | None = None,
    ):
        self.ingestion: DataIngestionService = ingestion or DataIngestionService()
        self.validation: ValidationService = validation or ValidationService()
        self.feature_store: FeatureStoreService = feature_store or FeatureStoreService()
        self.pipelines: PipelineService = pipelines or PipelineService()

    def health(self) -> dict:
        return {
            "service": "data",
            "status": "ok",
            "subsystems": {
                "ingestion": self.ingestion.health(),
                "validation": self.validation.health(),
                "feature_store": self.feature_store.health(),
                "pipelines": self.pipelines.health(),
            },
        }


__all__ = [
    "DataService",
    "DataIngestionService",
    "ValidationService",
    "FeatureStoreService",
    "PipelineService",
]
