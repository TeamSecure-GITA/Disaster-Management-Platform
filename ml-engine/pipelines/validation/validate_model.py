from __future__ import annotations

from pathlib import Path
from typing import Any
import joblib


def validate_model_checkpoint(checkpoint_path: str | Path) -> dict[str, Any]:
    p = Path(checkpoint_path)
    if not p.exists():
        return {"is_valid": False, "error": f"Checkpoint file not found: {checkpoint_path}"}

    try:
        payload = joblib.load(p)
        if not isinstance(payload, dict):
            return {"is_valid": False, "error": "Invalid checkpoint payload structure"}

        model = payload.get("model")
        feature_names = payload.get("feature_names", [])

        if model is None:
            return {"is_valid": False, "error": "Model estimator is None in checkpoint"}

        if not hasattr(model, "predict"):
            return {"is_valid": False, "error": "Loaded estimator does not implement predict()"}

        return {
            "is_valid": True,
            "model_type": type(model).__name__,
            "features_count": len(feature_names),
            "features": feature_names,
            "has_predict_proba": hasattr(model, "predict_proba"),
        }
    except Exception as e:
        return {"is_valid": False, "error": str(e)}


if __name__ == "__main__":
    res = validate_model_checkpoint("models/landslide/checkpoints/model.joblib")
    print("Model validation result:", res)
