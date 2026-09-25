from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from .base_trainer import BaseTrainer
from .training_config import TrainingConfig


class LandslideTrainer(BaseTrainer):
    """Trainer for landslide susceptibility and slope hazard risk prediction."""

    def __init__(self, config: TrainingConfig | None = None) -> None:
        if config is None:
            config = TrainingConfig(
                model_name="landslide_risk_model",
                hazard_type="landslide",
                algorithm="random_forest",
                target_column="landslide_occurred",
                feature_columns=[
                    "slope_angle",
                    "rainfall_mm",
                    "soil_moisture",
                    "pore_pressure",
                    "elevation",
                    "displacement",
                    "antecedent_precipitation_index",
                    "gravitational_shear_index",
                    "landslide_susceptibility_index",
                ],
                hyperparameters={
                    "n_estimators": 100,
                    "max_depth": 12,
                    "min_samples_split": 5,
                    "class_weight": "balanced",
                    "random_state": 42,
                },
            )
        super().__init__(config)

    def build_model(self) -> RandomForestClassifier | GradientBoostingClassifier:
        algo = self.config.algorithm.lower()
        hp = self.config.hyperparameters.copy()

        if algo == "gradient_boosting":
            hp.pop("class_weight", None)
            return GradientBoostingClassifier(**hp)

        return RandomForestClassifier(**hp)
