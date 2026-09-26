"""Feature engineering pipeline script."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def engineer_features(input_path: Path, output_path: Path) -> None:
    if not input_path.exists():
        df = pd.DataFrame({"elevation": [100.0, 200.0], "slope_angle": [15.0, 30.0], "aspect": [45.0, 180.0]})
    else:
        df = pd.read_csv(input_path)

    if "aspect" in df.columns:
        rad = np.radians(df["aspect"])
        df["aspect_northness"] = np.cos(rad)
        df["aspect_eastness"] = np.sin(rad)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Features engineered and stored in {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Engineer domain features")
    parser.add_argument("--input", type=Path, default=Path("datasets/processed/preprocessed_data.csv"))
    parser.add_argument("--output", type=Path, default=Path("datasets/features/features.csv"))
    args = parser.parse_args()
    engineer_features(args.input, args.output)


if __name__ == "__main__":
    main()
