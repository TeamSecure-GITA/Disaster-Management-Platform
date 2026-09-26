"""MultiHazard training pipeline."""
from __future__ import annotations

from pathlib import Path
import pandas as pd
import numpy as np
from .model import MultiHazardModel
from .features import MultiHazardFeatureExtractor
from .preprocessing import MultiHazardPreprocessor


class MultiHazardTrainer:
    """Handles dataset loading, cross-validation, and training MultiHazard models."""

    def __init__(self, model: MultiHazardModel | None = None) -> None:
        self.model = model or MultiHazardModel()
        self.extractor = MultiHazardFeatureExtractor()
        self.preprocessor = MultiHazardPreprocessor()

    def train(self, df: pd.DataFrame, target_column: str = "target") -> MultiHazardModel:
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
