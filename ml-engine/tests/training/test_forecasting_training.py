import pandas as pd
from src.training.forecasting_trainer import ForecastingTrainer
from src.training.training_config import TrainingConfig


def test_forecasting_trainer():
    df = pd.DataFrame({
        "lag_1": [1.0, 2.0, 3.0, 4.0, 5.0] * 5,
        "lag_2": [0.5, 1.5, 2.5, 3.5, 4.5] * 5,
        "target_value": [1.2, 2.3, 3.4, 4.1, 5.2] * 5,
    })
    trainer = ForecastingTrainer(TrainingConfig(
        hazard_type="forecasting",
        target_column="target_value",
        test_size=0.25,
        hyperparameters={"n_estimators": 15, "max_depth": 3, "random_state": 42},
    ))
    metrics = trainer.train(df)
    assert trainer.is_trained
    assert "mae" in metrics
    assert "rmse" in metrics
