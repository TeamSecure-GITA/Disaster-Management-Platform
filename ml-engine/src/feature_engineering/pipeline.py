from __future__ import annotations

from typing import Sequence
import pandas as pd

from .base import BaseFeatureExtractor
from .temporal import TemporalFeatureExtractor
from .spatial import SpatialFeatureExtractor
from .rainfall import RainfallFeatureExtractor
from .soil import SoilFeatureExtractor
from .geotechnical import GeotechnicalFeatureExtractor
from .seismic import SeismicFeatureExtractor
from .weather import WeatherFeatureExtractor
from .terrain import TerrainFeatureExtractor
from .hazard import HazardFeatureExtractor


class FeatureEngineeringPipeline:
    """Orchestrates sequential domain feature extraction transformers."""

    def __init__(self, extractors: Sequence[BaseFeatureExtractor] | None = None) -> None:
        self.extractors = list(
            extractors
            if extractors is not None
            else [
                TemporalFeatureExtractor(),
                SpatialFeatureExtractor(),
                RainfallFeatureExtractor(),
                SoilFeatureExtractor(),
                GeotechnicalFeatureExtractor(),
                SeismicFeatureExtractor(),
                WeatherFeatureExtractor(),
                TerrainFeatureExtractor(),
                HazardFeatureExtractor(),
            ]
        )

    def add_extractor(self, extractor: BaseFeatureExtractor) -> FeatureEngineeringPipeline:
        self.extractors.append(extractor)
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run all extractors in sequence."""
        df_out = df.copy()
        for ext in self.extractors:
            try:
                df_out = ext.transform(df_out)
            except Exception:
                # If an extractor encounters schema mismatch, continue gracefully
                pass
        return df_out

    def __call__(self, df: pd.DataFrame) -> pd.DataFrame:
        return self.transform(df)
