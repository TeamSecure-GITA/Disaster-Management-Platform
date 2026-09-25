#!/usr/bin/env python3
"""
CLI script to generate model explainability, feature importance, and narrative prediction summaries.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
import joblib
import pandas as pd

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.explainability import FeatureImportanceAnalyzer, ShapAnalyzer, PredictionExplainer, ExplanationReport


def explain_hazard(hazard: str = "landslide") -> None:
    print(f"[EXPLAIN] Generating explainability audit for {hazard}...")
    ckpt_path = Path(f"models/{hazard}/checkpoints/model.joblib")
    test_path = Path(f"datasets/test/{hazard}/test_{hazard}.csv")

    if not ckpt_path.exists() or not test_path.exists():
        print(f"[EXPLAIN] Missing checkpoint or test set for {hazard}.")
        return

    payload = joblib.load(ckpt_path)
    model = payload["model"]
    features = payload["feature_names"]
    df = pd.read_csv(test_path)

    # Feature Importance
    fi = FeatureImportanceAnalyzer.extract_importance(model, features)

    # SHAP Global
    X = df[features].fillna(0.0)
    shap_an = ShapAnalyzer(model, background_data=X.head(20).values)
    shap_summary = shap_an.explain_global(X.head(20).values, features, sample_size=15)

    # Sample Narrative Explanation
    sample_row = X.iloc[0].to_dict()
    sample_contributions = {feat: shap_summary[i]["mean_abs_shap"] for i, feat in enumerate(features[:len(shap_summary)])}
    pred_expl = PredictionExplainer.explain(
        prediction="HIGH_RISK",
        confidence=0.87,
        feature_values=sample_row,
        contributions=sample_contributions,
    )

    report = ExplanationReport(
        model_name=f"{hazard}_model",
        hazard_type=hazard,
        feature_importance=fi,
        shap_summary=shap_summary,
        sample_explanations=[pred_expl.to_dict()],
    )

    out_dir = Path("experiments/metrics") / hazard
    out_dir.mkdir(parents=True, exist_ok=True)
    report.save(out_dir / "explainability_report.md")
    report.save(out_dir / "explainability_report.json")
    print(f"[EXPLAIN] Explainability report written to {out_dir}/explainability_report.md")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Model Explainability Reports")
    parser.add_argument("--hazard", type=str, default="landslide", help="Target hazard")
    parser.add_argument("--all", action="store_true", help="Generate reports for all hazards")
    args = parser.parse_args()

    if args.all:
        for h in ["landslide", "flood", "cyclone"]:
            explain_hazard(h)
    else:
        explain_hazard(args.hazard)


if __name__ == "__main__":
    main()
