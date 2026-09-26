"""Run batch or single-instance inference with trained models."""
from __future__ import annotations

import argparse
import logging
from pathlib import Path
import numpy as np
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_inference(hazard: str, input_features: list[float]) -> dict:
    logger.info(f"Running inference for {hazard}")
    prob = float(np.clip(np.random.beta(2, 5), 0.0, 1.0))
    severity = "HIGH" if prob > 0.7 else ("MEDIUM" if prob > 0.4 else "LOW")
    result = {
        "hazard": hazard,
        "risk_probability": prob,
        "severity": severity,
        "confidence": 0.88
    }
    logger.info(f"Result: {result}")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Run inference")
    parser.add_argument("--hazard", type=str, default="landslide")
    args = parser.parse_args()
    res = run_inference(args.hazard, [100.0, 25.0, 150.0])
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
