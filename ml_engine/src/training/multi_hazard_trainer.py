from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class MultiHazardTrainer(BaseTrainer):
    """Trainer for multi-hazard compound cascading threat assessment."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="multi_hazard_risk_classifier",
                hazard_type="multi_hazard",
                algorithm="random_forest",
                target_column="overall_risk_level",
                feature_columns=[
                    "landslide_susceptibility_index",
                    "flood_potential_index",
                    "fire_danger_index",
                    "cyclone_power_dissipation_index",
                    "seismic_energy_log10_j",
                    "rainfall_mm",
                    "wind_speed",
                ],
                hyperparameters={
                    "n_estimators": 150,
                    "max_depth": 14,
                    "class_weight": "balanced",
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> RandomForestClassifier:
        return RandomForestClassifier(**self.config.hyperparameters)
