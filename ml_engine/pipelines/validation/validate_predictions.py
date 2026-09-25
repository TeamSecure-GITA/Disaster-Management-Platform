from __future__ import annotations

from typing import Any
import numpy as np


def validate_prediction_payload(payload: dict[str, Any]) -> dict[str, Any]:
    errors = []
    warnings = []

    # Check risk score or probability bounds
    if "risk_score" in payload and payload["risk_score"] is not None:
        score = float(payload["risk_score"])
        if np.isnan(score) or np.isinf(score):
            errors.append("risk_score is NaN or Infinite")
        elif not (0.0 <= score <= 1.0):
            errors.append(f"risk_score {score} is outside [0.0, 1.0]")

    # Check confidence bounds
    if "confidence" in payload and payload["confidence"] is not None:
        conf = float(payload["confidence"])
        if not (0.0 <= conf <= 1.0):
            warnings.append(f"confidence {conf} is outside expected [0.0, 1.0]")

    # Check risk level vocabulary
    valid_risk_levels = {"LOW", "MODERATE", "HIGH", "CRITICAL", "ADVISORY", "WARNING", "EVACUATION", "NORMAL"}
    if "risk_level" in payload and payload["risk_level"] is not None:
        level = str(payload["risk_level"]).upper()
        if level not in valid_risk_levels:
            warnings.append(f"Unrecognized risk_level '{level}'")

    is_valid = len(errors) == 0
    return {
        "is_valid": is_valid,
        "errors": errors,
        "warnings": warnings,
    }


if __name__ == "__main__":
    check = validate_prediction_payload({"risk_score": 0.85, "confidence": 0.92, "risk_level": "HIGH"})
    print("Prediction validation result:", check)
