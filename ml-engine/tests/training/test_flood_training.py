import pandas as pd
from src.training.flood_trainer import FloodTrainer
from src.training.training_config import TrainingConfig


def test_flood_trainer():
    df = pd.DataFrame({
        "water_level": [2.0, 3.5, 5.0, 8.5] * 5,
        "flow_rate": [50.0, 100.0, 250.0, 400.0] * 5,
        "discharge": [100.0, 200.0, 600.0, 1100.0] * 5,
        "rainfall_mm": [5.0, 20.0, 60.0, 120.0] * 5,
        "rain_rolling_6h": [10.0, 25.0, 70.0, 140.0] * 5,
        "rain_rolling_24h": [20.0, 40.0, 110.0, 200.0] * 5,
        "flood_potential_index": [0.2, 0.8, 2.1, 4.5] * 5,
        "topographic_wetness_index": [5.0, 7.0, 10.0, 13.0] * 5,
        "flood_alert_level": [0, 1, 2, 3] * 5,
    })
    trainer = FloodTrainer(TrainingConfig(
        hazard_type="flood",
        target_column="flood_alert_level",
        test_size=0.25,
        hyperparameters={"n_estimators": 10, "max_depth": 3, "random_state": 42},
    ))
    metrics = trainer.train(df)
    assert trainer.is_trained
    assert "accuracy" in metrics
