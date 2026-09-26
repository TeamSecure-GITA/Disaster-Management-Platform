"""Flood end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import FloodModel
from .features import FloodFeatureExtractor
from .preprocessing import FloodPreprocessor
from src.core.prediction import PredictionResult


class FloodPredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: FloodModel | None = None) -> None:
        self.model = model or FloodModel()
        self.extractor = FloodFeatureExtractor()
        self.preprocessor = FloodPreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
