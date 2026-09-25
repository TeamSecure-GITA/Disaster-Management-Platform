from __future__ import annotations

from typing import Any
from .train_landslide import run_landslide_training
from .train_flood import run_flood_training
from .train_cyclone import run_cyclone_training
from .train_anomaly import run_anomaly_training
from .train_forecasting import run_forecasting_training


def run_all_training() -> dict[str, Any]:
    print("=" * 60)
    print("STARTING ML ENGINE GLOBAL MODEL TRAINING PIPELINE")
    print("=" * 60)

    results = {}
    results["landslide"] = run_landslide_training()
    results["flood"] = run_flood_training()
    results["cyclone"] = run_cyclone_training()
    results["anomaly"] = run_anomaly_training()
    results["forecasting"] = run_forecasting_training()

    print("=" * 60)
    print("ALL HAZARD MODELS TRAINED AND SAVED SUCCESSFULLY")
    print("=" * 60)
    return results


if __name__ == "__main__":
    run_all_training()
