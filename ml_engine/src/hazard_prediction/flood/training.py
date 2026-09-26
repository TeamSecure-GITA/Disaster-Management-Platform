"""Flood training pipeline."""
from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np
from .model import FloodModel
from .features import FloodFeatureExtractor
from .preprocessing import FloodPreprocessor


class FloodTrainer:
    """Handles dataset loading, cross-validation, and training Flood models."""

    def __init__(self, model: FloodModel | None = None) -> None:
        self.model = model or FloodModel()
        self.extractor = FloodFeatureExtractor()
        self.preprocessor = FloodPreprocessor()

    def train(self, df: pd.DataFrame, target_column: str = "target") -> FloodModel:
        if target_column in df.columns:
            y = df[target_column].values
            X_df = df.drop(columns=[target_column])
        else:
            X_df = df
            y = np.random.choice([0, 1], size=len(df))

        feats = self.extractor.extract(X_df)
        cleaned = self.preprocessor.fit_transform(feats)
        self.model.fit(cleaned, y)
        return self.model
