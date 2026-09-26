"""Dataset preparation and raw data ingestion pipeline."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def prepare_synthetic_hazard_data(output_dir: Path) -> None:
    """Generates initial synthetic benchmark datasets if raw sources are empty."""
    output_dir.mkdir(parents=True, exist_ok=True)
    np.random.seed(42)
    n = 200
    df = pd.DataFrame({
        "timestamp": pd.date_range("2026-01-01", periods=n, freq="h"),
        "elevation": np.random.uniform(50, 1500, n),
        "slope_angle": np.random.uniform(5, 55, n),
        "aspect": np.random.uniform(0, 360, n),
        "rainfall_24h": np.random.exponential(15, n),
        "soil_moisture": np.random.uniform(10, 95, n),
        "hazard_label": np.random.choice([0, 1], p=[0.75, 0.25], size=n)
    })
    target_file = output_dir / "hazard_samples.csv"
    df.to_csv(target_file, index=False)
    logger.info(f"Prepared dataset saved to {target_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare datasets for ML engine")
    parser.add_argument("--output-dir", type=Path, default=Path("datasets/raw"))
    args = parser.parse_args()
    prepare_synthetic_hazard_data(args.output_dir)


if __name__ == "__main__":
    main()
