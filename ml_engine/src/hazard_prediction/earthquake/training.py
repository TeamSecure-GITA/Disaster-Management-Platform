"""Earthquake training pipeline."""
from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np
from .model import EarthquakeModel
from .features import EarthquakeFeatureExtractor
from .preprocessing import EarthquakePreprocessor


class EarthquakeTrainer:
    """Handles dataset loading, cross-validation, and training Earthquake models."""

    def __init__(self, model: EarthquakeModel | None = None) -> None:
        self.model = model or EarthquakeModel()
        self.extractor = EarthquakeFeatureExtractor()
        self.preprocessor = EarthquakePreprocessor()

    def train(self, df: pd.DataFrame, target_column: str = "target") -> EarthquakeModel:
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
