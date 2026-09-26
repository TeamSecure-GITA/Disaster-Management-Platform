"""Earthquake predictive model implementation."""
from __future__ import annotations

import os
from typing import Any
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingClassifier
from src.core.base_model import BaseModel
from src.core.model_config import ModelConfig
from src.core.prediction import PredictionResult


class EarthquakeModel(BaseModel):
    """Earthquake hazard forecasting model."""

    def __init__(self, config: ModelConfig | None = None) -> None:
        cfg = config or ModelConfig(
            model_name="earthquake_predictor",
            threshold=0.55,
            feature_names=['hypocentral_depth_km', 'peak_ground_acceleration_pga', 'fault_distance_km', 'shear_wave_velocity_vs30'],
        )
        super().__init__(cfg)
        self.estimator = GradientBoostingClassifier(
            n_estimators=self.config.hyperparameters.get("n_estimators", 50),
            random_state=self.config.random_seed,
        )

    def fit(self, X: Any, y: Any | None = None) -> EarthquakeModel:
        if isinstance(X, pd.DataFrame):
            X_mat = X.values
        else:
            X_mat = np.asarray(X)

        if y is None:
            y_mat = np.random.choice([0, 1], size=len(X_mat))
        else:
            y_mat = np.asarray(y)

        self.estimator.fit(X_mat, y_mat)
        self.is_fitted = True
        return self

    def predict(self, X: Any) -> PredictionResult:
        if isinstance(X, pd.DataFrame):
            X_mat = X.values
        elif isinstance(X, dict):
            X_mat = np.array([[X.get(k, 0.0) for k in self.config.feature_names]])
        else:
            X_mat = np.atleast_2d(X)

        if not self.is_fitted:
            prob = float(np.clip(np.mean(X_mat) / 100.0, 0.05, 0.95))
        else:
            prob = float(self.estimator.predict_proba(X_mat)[0, 1])

        severity = "CRITICAL" if prob >= 0.55 else ("WARNING" if prob >= 0.4 else "LOW")
        return PredictionResult(
            model_name=self.config.model_name,
            prediction=int(prob >= self.config.threshold),
            probability=prob,
            severity=severity,
            metadata={"threshold": self.config.threshold},
        )

    def save(self, filepath: str) -> None:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({"config": self.config, "estimator": self.estimator, "fitted": self.is_fitted}, filepath)

    def load(self, filepath: str) -> EarthquakeModel:
        data = joblib.load(filepath)
        self.config = data["config"]
        self.estimator = data["estimator"]
        self.is_fitted = data["fitted"]
        return self
