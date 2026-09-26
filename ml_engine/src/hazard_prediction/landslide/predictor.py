"""Landslide end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import LandslideModel
from .features import LandslideFeatureExtractor
from .preprocessing import LandslidePreprocessor
from src.core.prediction import PredictionResult


class LandslidePredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: LandslideModel | None = None) -> None:
        self.model = model or LandslideModel()
        self.extractor = LandslideFeatureExtractor()
        self.preprocessor = LandslidePreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
