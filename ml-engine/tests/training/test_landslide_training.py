import pandas as pd
from src.training.landslide_trainer import LandslideTrainer
from src.training.training_config import TrainingConfig


def test_landslide_trainer():
    df = pd.DataFrame({
        "slope_angle": [15.0, 20.0, 35.0, 42.0] * 5,
        "rainfall_mm": [10.0, 30.0, 95.0, 140.0] * 5,
        "soil_moisture": [20.0, 25.0, 45.0, 60.0] * 5,
        "pore_pressure": [5.0, 10.0, 30.0, 45.0] * 5,
        "elevation": [200.0, 300.0, 800.0, 1200.0] * 5,
        "displacement": [0.0, 0.5, 4.0, 8.5] * 5,
        "antecedent_precipitation_index": [10.0, 25.0, 75.0, 120.0] * 5,
        "gravitational_shear_index": [0.2, 0.3, 0.5, 0.7] * 5,
        "landslide_susceptibility_index": [0.1, 0.3, 1.5, 3.2] * 5,
        "landslide_occurred": [0, 0, 1, 1] * 5,
    })
    trainer = LandslideTrainer(TrainingConfig(
        hazard_type="landslide",
        target_column="landslide_occurred",
        test_size=0.25,
        hyperparameters={"n_estimators": 10, "max_depth": 3, "random_state": 42},
    ))
    metrics = trainer.train(df)
    assert trainer.is_trained
    assert "accuracy" in metrics
    assert "f1" in metrics
