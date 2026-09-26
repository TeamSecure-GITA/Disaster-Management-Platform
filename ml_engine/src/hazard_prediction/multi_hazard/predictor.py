"""MultiHazard end-to-end inference predictor."""
from __future__ import annotations

from typing import Any
import pandas as pd
from .model import MultiHazardModel
from .features import MultiHazardFeatureExtractor
from .preprocessing import MultiHazardPreprocessor
from src.core.prediction import PredictionResult


class MultiHazardPredictor:
    """End-to-end predictor bundling feature extraction, preprocessing, and inference."""

    def __init__(self, model: MultiHazardModel | None = None) -> None:
        self.model = model or MultiHazardModel()
        self.extractor = MultiHazardFeatureExtractor()
        self.preprocessor = MultiHazardPreprocessor()

    def predict(self, raw_input: dict[str, Any] | pd.DataFrame) -> PredictionResult:
        features = self.extractor.extract(raw_input)
        cleaned = self.preprocessor.fit_transform(features)
        return self.model.predict(cleaned)
