"""Network anomaly detector implementation."""
from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from ..base_detector import BaseAnomalyDetector
from .features import NetworkAnomalyFeatures
from .preprocessing import NetworkAnomalyPreprocessor


class NetworkAnomalyDetector(BaseAnomalyDetector):
    """Unsupervised Isolation Forest detector for network anomalies."""

    def __init__(self, contamination: float = 0.05) -> None:
        super().__init__(contamination=contamination)
        self.estimator = IsolationForest(contamination=contamination, random_state=42)
        self.extractor = NetworkAnomalyFeatures()
        self.preprocessor = NetworkAnomalyPreprocessor()

    def fit(self, X: Any) -> NetworkAnomalyDetector:
        if isinstance(X, (pd.DataFrame, dict)):
            df = self.preprocessor.transform(self.extractor.extract(X))
            mat = df.values
        else:
            mat = np.asarray(X)
        self.estimator.fit(mat)
        self.is_fitted = True
        return self

    def detect(self, X: Any) -> np.ndarray:
        if isinstance(X, (pd.DataFrame, dict)):
            df = self.preprocessor.transform(self.extractor.extract(X))
            mat = df.values
        else:
            mat = np.asarray(X)

        if not self.is_fitted:
            self.fit(mat)
        preds = self.estimator.predict(mat)
        return (preds == -1)

    def score_samples(self, X: Any) -> np.ndarray:
        if isinstance(X, (pd.DataFrame, dict)):
            df = self.preprocessor.transform(self.extractor.extract(X))
            mat = df.values
        else:
            mat = np.asarray(X)

        if not self.is_fitted:
            self.fit(mat)
        # Isolation forest scores: lower is more anomalous -> invert so higher is more anomalous
        return -self.estimator.score_samples(mat)
