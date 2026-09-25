#!/usr/bin/env python3
"""
CLI script to prepare and preprocess raw datasets into processed feature-ready tables.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
import pandas as pd

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.preprocessing import PreprocessingPipeline
from src.feature_engineering import FeatureEngineeringPipeline


def prepare_datasets() -> None:
    raw_dir = Path("datasets/raw")
    proc_dir = Path("datasets/processed")
    proc_dir.mkdir(parents=True, exist_ok=True)

    print("[PREPARE] Processing raw telemetry into clean feature datasets...")

    pipeline = PreprocessingPipeline()
    fe_pipeline = FeatureEngineeringPipeline()

    csv_files = list(raw_dir.rglob("*.csv"))
    for csv_file in csv_files:
        try:
            df = pd.read_csv(csv_file)
            clean_df = pipeline.cleaner.clean(df)
            fe_df = fe_pipeline.transform(clean_df)

            stream_name = csv_file.parent.name
            out_subdir = proc_dir / stream_name
            out_subdir.mkdir(parents=True, exist_ok=True)
            out_file = out_subdir / f"processed_{csv_file.name}"
            fe_df.to_csv(out_file, index=False)
            print(f"  [OK] Processed {csv_file.name} -> {out_file} (rows: {len(fe_df)}, cols: {len(fe_df.columns)})")
        except Exception as e:
            print(f"  [SKIP] Could not process {csv_file.name}: {e}")

    print("[PREPARE] Dataset preparation complete.")


if __name__ == "__main__":
    prepare_datasets()
