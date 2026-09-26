"""Wildfire end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import WildfireModel
from .features import WildfireFeatureExtractor
from .preprocessing import WildfirePreprocessor
from src.core.prediction import PredictionResult


class WildfirePredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: WildfireModel | None = None) -> None:
        self.model = model or WildfireModel()
        self.extractor = WildfireFeatureExtractor()
        self.preprocessor = WildfirePreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
