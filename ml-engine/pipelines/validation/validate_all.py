from __future__ import annotations

from pathlib import Path
from typing import Any
from .validate_dataset import validate_dataset_file
from .validate_model import validate_model_checkpoint


def run_all_validation() -> dict[str, Any]:
    print("=" * 60)
    print("RUNNING GLOBAL ML ENGINE VALIDATION PIPELINE")
    print("=" * 60)

    dataset_results = {}
    test_benchmarks = [
        "datasets/test/landslide/test_landslide.csv",
        "datasets/test/flood/test_flood.csv",
        "datasets/test/cyclone/test_cyclone.csv",
        "datasets/test/anomaly/test_anomaly.csv",
        "datasets/test/forecasting/test_forecasting.csv",
    ]

    for ds in test_benchmarks:
        if Path(ds).exists():
            rep = validate_dataset_file(ds)
            dataset_results[ds] = {"valid": rep.is_valid, "total": rep.total_records, "passed": rep.passed_records}
            print(f"[DATASET-VALIDATION] {ds}: valid={rep.is_valid} ({rep.passed_records}/{rep.total_records})")

    model_results = {}
    checkpoints = [
        "models/landslide/checkpoints/model.joblib",
        "models/flood/checkpoints/model.joblib",
        "models/cyclone/checkpoints/model.joblib",
        "models/anomaly/checkpoints/model.joblib",
        "models/forecasting/checkpoints/model.joblib",
    ]

    for ckpt in checkpoints:
        if Path(ckpt).exists():
            chk = validate_model_checkpoint(ckpt)
            model_results[ckpt] = chk
            print(f"[MODEL-VALIDATION] {ckpt}: valid={chk.get('is_valid')} ({chk.get('model_type')})")

    print("=" * 60)
    print("VALIDATION PIPELINE COMPLETED")
    print("=" * 60)

    return {
        "datasets": dataset_results,
        "models": model_results,
    }


if __name__ == "__main__":
    run_all_validation()
