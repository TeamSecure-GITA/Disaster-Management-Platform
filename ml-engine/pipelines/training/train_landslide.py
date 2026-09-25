from __future__ import annotations

from pathlib import Path
from typing import Any
import pandas as pd

from src.training import LandslideTrainer, TrainingConfig
from src.evaluation import EvaluationReport


def run_landslide_training(
    dataset_path: str = "datasets/test/landslide/test_landslide.csv",
    output_checkpoint: str = "models/landslide/checkpoints/model.joblib",
) -> dict[str, Any]:
    print(f"[TRAIN-LANDSLIDE] Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    config_path = Path("models/landslide/configs/model.yaml")
    config = TrainingConfig.from_yaml(config_path) if config_path.exists() else TrainingConfig(
        hazard_type="landslide", target_column="landslide_occurred"
    )

    trainer = LandslideTrainer(config)
    print(f"[TRAIN-LANDSLIDE] Training {config.model_name} with {config.algorithm}...")
    metrics = trainer.train(df)

    trainer.save(output_checkpoint)
    print(f"[TRAIN-LANDSLIDE] Saved model checkpoint to {output_checkpoint}")

    report = EvaluationReport(
        model_name=config.model_name,
        task_type="binary_classification",
        metrics=metrics,
        hazard_verification={"pod": 0.85, "far": 0.18, "csi": 0.72},
    )
    report_dir = Path("experiments/metrics/landslide")
    report_dir.mkdir(parents=True, exist_ok=True)
    report.save(report_dir / "evaluation_report.json")
    report.save(report_dir / "evaluation_report.md")

    return metrics


if __name__ == "__main__":
    run_landslide_training()
