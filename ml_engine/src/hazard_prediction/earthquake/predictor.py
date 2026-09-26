"""Earthquake end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import EarthquakeModel
from .features import EarthquakeFeatureExtractor
from .preprocessing import EarthquakePreprocessor
from src.core.prediction import PredictionResult


class EarthquakePredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: EarthquakeModel | None = None) -> None:
        self.model = model or EarthquakeModel()
        self.extractor = EarthquakeFeatureExtractor()
        self.preprocessor = EarthquakePreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
