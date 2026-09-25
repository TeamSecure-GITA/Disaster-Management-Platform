from __future__ import annotations

from typing import Any
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class ForecastingTrainer(BaseTrainer):
    """Trainer for continuous environmental time series and regression forecasting."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="environmental_forecasting_model",
                hazard_type="forecasting",
                algorithm="gradient_boosting",
                target_column="target_value",
                feature_columns=[],
                stratify=False,
                hyperparameters={
                    "n_estimators": 100,
                    "learning_rate": 0.05,
                    "max_depth": 5,
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> GradientBoostingRegressor | RandomForestRegressor:
        algo = self.config.algorithm.lower()
        hp = self.config.hyperparameters.copy()

        if algo == "random_forest":
            return RandomForestRegressor(**hp)

        return GradientBoostingRegressor(**hp)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> dict[str, float]:
        """Evaluate regression forecasting performance."""
        if not self.is_trained or self.model is None:
            raise RuntimeError("Model is not trained yet.")

        y_pred = self.model.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        return {
            "mae": mae,
            "mse": mse,
            "rmse": float(mse ** 0.5),
            "r2": r2,
        }
