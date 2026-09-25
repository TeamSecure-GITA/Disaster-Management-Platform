#!/usr/bin/env python3
"""
CLI script to audit and apply probability calibration to hazard models.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.calibration import ReliabilityDiagram, ProbabilityCalibrator, TemperatureScaler, CalibrationReport


def calibrate_hazard(hazard: str = "landslide") -> None:
    print(f"[CALIBRATE] Auditing probability calibration for {hazard}...")
    ckpt_path = Path(f"models/{hazard}/checkpoints/model.joblib")
    test_path = Path(f"datasets/test/{hazard}/test_{hazard}.csv")

    if not ckpt_path.exists() or not test_path.exists():
        print(f"[CALIBRATE] Required checkpoint ({ckpt_path}) or test set ({test_path}) missing. Skipping.")
        return

    payload = joblib.load(ckpt_path)
    model = payload["model"]
    features = payload["feature_names"]
    df = pd.read_csv(test_path)

    X = df[features].fillna(0.0)
    target_col = df.columns[-1]
    y_true = df[target_col].values

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)
        if probs.ndim > 1 and probs.shape[1] > 1:
            raw_prob = probs[:, 1]
        else:
            raw_prob = probs.ravel()
    else:
        raw_prob = np.clip(model.predict(X), 0.0, 1.0)

    reliability = ReliabilityDiagram()
    rel_pre = reliability.compute(y_true, raw_prob)

    # Temperature Scaling
    ts = TemperatureScaler()
    ts.fit(raw_prob, y_true)
    cal_prob = ts.scale_probabilities(raw_prob)
    rel_post = reliability.compute(y_true, cal_prob)

    report = CalibrationReport(
        model_name=f"{hazard}_model",
        method_used="temperature_scaling",
        uncalibrated_ece=rel_pre["expected_calibration_error_ece"],
        calibrated_ece=rel_post["expected_calibration_error_ece"],
        uncalibrated_brier=float(np.mean((raw_prob - y_true) ** 2)),
        calibrated_brier=float(np.mean((cal_prob - y_true) ** 2)),
        summary=f"Temperature scaled with T={ts.temperature:.3f}. Reduced ECE from {rel_pre['expected_calibration_error_ece']:.4f} to {rel_post['expected_calibration_error_ece']:.4f}."
    )

    out_dir = Path("experiments/metrics") / hazard
    out_dir.mkdir(parents=True, exist_ok=True)
    report.save(out_dir / "calibration_report.md")
    report.save(out_dir / "calibration_report.json")
    print(f"[CALIBRATE] Calibration audit written to {out_dir}/calibration_report.md")


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit Model Probability Calibration")
    parser.add_argument("--hazard", type=str, default="landslide", help="Target hazard")
    parser.add_argument("--all", action="store_true", help="Calibrate all hazard models")
    args = parser.parse_args()

    if args.all:
        for h in ["landslide", "flood", "cyclone"]:
            calibrate_hazard(h)
    else:
        calibrate_hazard(args.hazard)


if __name__ == "__main__":
    main()
