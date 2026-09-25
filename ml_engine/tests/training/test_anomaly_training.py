import pandas as pd
from src.training.anomaly_trainer import AnomalyTrainer
from src.training.training_config import TrainingConfig


def test_anomaly_trainer():
    df = pd.DataFrame({
        "temperature": [25.0, 26.0, 24.5, 25.5, 95.0] * 5,
        "humidity": [60.0, 62.0, 58.0, 61.0, 5.0] * 5,
        "is_anomaly": [0, 0, 0, 0, 1] * 5,
    })
    trainer = AnomalyTrainer(TrainingConfig(
        hazard_type="anomaly",
        hyperparameters={"n_estimators": 20, "contamination": 0.1, "random_state": 42},
    ))
    res = trainer.train(df)
    assert trainer.is_trained
    assert "anomaly_ratio" in res
