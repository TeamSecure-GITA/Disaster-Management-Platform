from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class FloodTrainer(BaseTrainer):
    """Trainer for flood inundation and riverine alert prediction."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="flood_hazard_model",
                hazard_type="flood",
                algorithm="gradient_boosting",
                target_column="flood_alert_level",
                feature_columns=[
                    "water_level",
                    "flow_rate",
                    "discharge",
                    "rainfall_mm",
                    "rain_rolling_6h",
                    "rain_rolling_24h",
                    "flood_potential_index",
                    "topographic_wetness_index",
                ],
                hyperparameters={
                    "n_estimators": 120,
                    "learning_rate": 0.08,
                    "max_depth": 6,
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> GradientBoostingClassifier | RandomForestClassifier:
        algo = self.config.algorithm.lower()
        hp = self.config.hyperparameters.copy()

        if algo == "random_forest":
            return RandomForestClassifier(**hp)

        return GradientBoostingClassifier(**hp)
