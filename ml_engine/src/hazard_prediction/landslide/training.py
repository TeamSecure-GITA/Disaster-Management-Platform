"""Landslide training pipeline."""
from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np
from .model import LandslideModel
from .features import LandslideFeatureExtractor
from .preprocessing import LandslidePreprocessor


class LandslideTrainer:
    """Handles dataset loading, cross-validation, and training Landslide models."""

    def __init__(self, model: LandslideModel | None = None) -> None:
        self.model = model or LandslideModel()
        self.extractor = LandslideFeatureExtractor()
        self.preprocessor = LandslidePreprocessor()

    def train(self, df: pd.DataFrame, target_column: str = "target") -> LandslideModel:
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
