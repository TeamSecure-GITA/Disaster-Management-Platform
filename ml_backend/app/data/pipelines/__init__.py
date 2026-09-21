"""
Pipelines sub-package.

Exports a unified ``PipelineService`` that orchestrates the three-stage
data pipeline: ingestion → preprocessing → feature engineering.
"""

from __future__ import annotations

from .feature_pipeline import (
    FeaturePipeline,
    FeaturePipelineResult,
    FloodRiskFeatureEngineer,
    SensorFeatureEngineer,
    WeatherFeatureEngineer,
)
from .ingestion_pipeline import (
    IngestionPipeline,
    IngestionRunResult,
    SourceRunStats,
)
from .preprocessing_pipeline import (
    ColumnSpec,
    ImputationStrategy,
    NormalisationStrategy,
    PreprocessingPipeline,
    ProcessedRecord,
)


class PipelineService:
    """
    Unified three-stage pipeline service facade.

    Stages:
    1. **Ingestion** — fetch raw data from all sources and validate
    2. **Preprocessing** — normalise, impute, and enrich
    3. **Feature engineering** — compute ML feature vectors and commit to store

    Example::

        svc = PipelineService()
        ingestion_result = svc.ingestion.run(["weather", "sensors"])
    """

    def __init__(
        self,
        ingestion_pipeline: IngestionPipeline | None = None,
        preprocessing_pipeline: PreprocessingPipeline | None = None,
        feature_pipeline: FeaturePipeline | None = None,
    ):
        self.ingestion: IngestionPipeline = ingestion_pipeline or IngestionPipeline()
        self.preprocessing: PreprocessingPipeline = (
            preprocessing_pipeline or PreprocessingPipeline()
        )
        self.feature: FeaturePipeline = feature_pipeline or FeaturePipeline()

    def health(self) -> dict:
        return {
            "service": "pipeline",
            "status": "ok",
            "stages": ["ingestion", "preprocessing", "feature_engineering"],
        }


__all__ = [
    "PipelineService",
    # Ingestion
    "IngestionPipeline",
    "IngestionRunResult",
    "SourceRunStats",
    # Preprocessing
    "PreprocessingPipeline",
    "ProcessedRecord",
    "ColumnSpec",
    "ImputationStrategy",
    "NormalisationStrategy",
    # Features
    "FeaturePipeline",
    "FeaturePipelineResult",
    "WeatherFeatureEngineer",
    "SensorFeatureEngineer",
    "FloodRiskFeatureEngineer",
]
