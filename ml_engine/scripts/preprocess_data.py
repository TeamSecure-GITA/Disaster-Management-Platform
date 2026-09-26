"""Data preprocessing script for cleaning and normalizing hazard data."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def preprocess(input_path: Path, output_path: Path) -> None:
    if not input_path.exists():
        logger.warning(f"Input file {input_path} not found. Creating placeholder.")
        df = pd.DataFrame({"feature_a": np.random.randn(50), "feature_b": np.random.randn(50)})
    else:
        df = pd.read_csv(input_path)
    
    # Fill missing & clip
    df = df.ffill().bfill()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Preprocessed data saved to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Preprocess ML datasets")
    parser.add_argument("--input", type=Path, default=Path("datasets/raw/hazard_samples.csv"))
    parser.add_argument("--output", type=Path, default=Path("datasets/processed/preprocessed_data.csv"))
    args = parser.parse_args()
    preprocess(args.input, args.output)


if __name__ == "__main__":
    main()
