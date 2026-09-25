from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class CycloneTrainer(BaseTrainer):
    """Trainer for tropical cyclone intensity category and storm surge hazard."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="cyclone_intensity_model",
                hazard_type="cyclone",
                algorithm="random_forest",
                target_column="cyclone_category",
                feature_columns=[
                    "wind_speed",
                    "central_pressure",
                    "storm_surge",
                    "radius_max_wind",
                    "movement_speed",
                    "cyclone_power_dissipation_index",
                    "vapor_pressure_deficit_kpa",
                ],
                hyperparameters={
                    "n_estimators": 100,
                    "max_depth": 10,
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> RandomForestClassifier | GradientBoostingClassifier:
        algo = self.config.algorithm.lower()
        hp = self.config.hyperparameters.copy()

        if algo == "gradient_boosting":
            return GradientBoostingClassifier(**hp)

        return RandomForestClassifier(**hp)
