"""Model training orchestration script."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier
import pandas as pd
import numpy as np
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train(hazard_type: str, output_dir: Path) -> None:
    logger.info(f"Starting training for hazard model: {hazard_type}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Synthetic training
    X = np.random.randn(100, 5)
    y = np.random.choice([0, 1], size=100)
    clf = GradientBoostingClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y)
    
    model_file = output_dir / f"{hazard_type}_model.joblib"
    joblib.dump(clf, model_file)
    logger.info(f"Model trained and saved to {model_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train disaster prediction models")
    parser.add_argument("--hazard", type=str, default="landslide", choices=["landslide", "flood", "cyclone", "earthquake", "wildfire", "all"])
    parser.add_argument("--output-dir", type=Path, default=Path("models/trained"))
    args = parser.parse_args()
    
    hazards = ["landslide", "flood", "cyclone", "earthquake", "wildfire"] if args.hazard == "all" else [args.hazard]
    for h in hazards:
        train(h, args.output_dir / h)


if __name__ == "__main__":
    main()
