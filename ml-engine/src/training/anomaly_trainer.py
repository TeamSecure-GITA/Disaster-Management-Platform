from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class AnomalyTrainer(BaseTrainer):
    """Trainer for sensor and telemetry anomaly detection using unsupervised estimators."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="sensor_anomaly_detector",
                hazard_type="anomaly",
                algorithm="isolation_forest",
                target_column="is_anomaly",
                feature_columns=[],
                hyperparameters={
                    "n_estimators": 100,
                    "contamination": 0.05,
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> IsolationForest | LocalOutlierFactor:
        algo = self.config.algorithm.lower()
        hp = self.config.hyperparameters.copy()

        if algo == "local_outlier_factor":
            hp.pop("random_state", None)
            return LocalOutlierFactor(novelty=True, **hp)

        return IsolationForest(**hp)

    def train(self, df: pd.DataFrame) -> dict[str, float]:
        """Train unsupervised anomaly detection model."""
        features = self.config.feature_columns
        if not features:
            features = list(df.select_dtypes(include=["number"]).columns)
            if self.config.target_column in features:
                features.remove(self.config.target_column)

        self.feature_names_ = features
        X = df[features].fillna(0.0)

        self.model = self.build_model()
        self.model.fit(X)
        self.is_trained = True

        # Compute in-sample anomaly ratio
        preds = self.model.predict(X)  # -1 for anomaly, 1 for normal
        anomaly_ratio = float((preds == -1).mean())

        return {
            "anomaly_ratio": anomaly_ratio,
            "samples_analyzed": float(len(X)),
        }
