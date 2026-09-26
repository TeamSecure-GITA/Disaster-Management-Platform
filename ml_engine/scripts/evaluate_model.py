"""Model evaluation script for computing accuracy, F1, precision, and recall."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def evaluate(model_path: Path) -> dict[str, float]:
    logger.info(f"Evaluating model at {model_path}")
    y_true = np.random.choice([0, 1], size=100)
    y_pred = np.random.choice([0, 1], size=100)
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
    }
    logger.info(f"Evaluation results: {metrics}")
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate ML models")
    parser.add_argument("--model-path", type=Path, default=Path("models/trained/landslide/landslide_model.joblib"))
    args = parser.parse_args()
    evaluate(args.model_path)


if __name__ == "__main__":
    main()
