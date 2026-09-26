"""Cyclone end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import CycloneModel
from .features import CycloneFeatureExtractor
from .preprocessing import CyclonePreprocessor
from src.core.prediction import PredictionResult


class CyclonePredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: CycloneModel | None = None) -> None:
        self.model = model or CycloneModel()
        self.extractor = CycloneFeatureExtractor()
        self.preprocessor = CyclonePreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
