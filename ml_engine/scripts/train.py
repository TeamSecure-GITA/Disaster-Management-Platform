#!/usr/bin/env python3
"""
CLI script to trigger model training for single or all hazard domains.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pipelines.training import (
    run_landslide_training,
    run_flood_training,
    run_cyclone_training,
    run_anomaly_training,
    run_forecasting_training,
    run_all_training,
)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train Disaster Management ML Models")
    parser.add_argument(
        "--hazard",
        type=str,
        choices=["landslide", "flood", "cyclone", "anomaly", "forecasting"],
        help="Target hazard model to train",
    )
    parser.add_argument("--all", action="store_true", help="Train all models in sequence")
    args = parser.parse_args()

    if args.all or not args.hazard:
        run_all_training()
    elif args.hazard == "landslide":
        run_landslide_training()
    elif args.hazard == "flood":
        run_flood_training()
    elif args.hazard == "cyclone":
        run_cyclone_training()
    elif args.hazard == "anomaly":
        run_anomaly_training()
    elif args.hazard == "forecasting":
        run_forecasting_training()


if __name__ == "__main__":
    main()
