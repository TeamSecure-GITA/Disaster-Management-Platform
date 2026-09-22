"""
ML Model Governance, Registry, and Drift Monitoring API router.
"""

from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/models", tags=["Operations - ML Models & Governance"])

_REGISTERED_MODELS = [
    {"model_id": "landslide-v1", "name": "landslide-risk-model", "version": "v1.2.0", "task": "susceptibility_classification", "status": "active", "drift_status": "in_bounds", "accuracy": 0.892, "f1_score": 0.874, "last_evaluated": "2026-09-21T18:00:00Z"},
    {"model_id": "flood-v1", "name": "flood-inundation-model", "version": "v2.0.1", "task": "inundation_regression", "status": "active", "drift_status": "in_bounds", "accuracy": 0.915, "f1_score": 0.898, "last_evaluated": "2026-09-22T06:00:00Z"},
    {"model_id": "cyclone-v1", "name": "cyclone-intensity-model", "version": "v1.1.0", "task": "surge_prediction", "status": "active", "drift_status": "in_bounds", "accuracy": 0.880, "f1_score": 0.865, "last_evaluated": "2026-09-20T12:00:00Z"},
    {"model_id": "earthquake-v1", "name": "earthquake-shaking-model", "version": "v1.0.4", "task": "ground_motion_attenuation", "status": "active", "drift_status": "in_bounds", "accuracy": 0.867, "f1_score": 0.852, "last_evaluated": "2026-09-18T00:00:00Z"},
    {"model_id": "wildfire-v1", "name": "wildfire-spread-model", "version": "v1.3.0", "task": "rate_of_spread", "status": "active", "drift_status": "slight_drift", "accuracy": 0.854, "f1_score": 0.841, "last_evaluated": "2026-09-21T09:00:00Z"},
    {"model_id": "multi-hazard-v1", "name": "multi-hazard-cascading-model", "version": "v2.0.0", "task": "cascading_probability", "status": "active", "drift_status": "in_bounds", "accuracy": 0.901, "f1_score": 0.887, "last_evaluated": "2026-09-22T08:00:00Z"},
]


@router.get("", response_model=List[Dict[str, Any]])
async def list_registered_models():
    """Retrieve all production machine learning models, active versions, and governance health."""
    return _REGISTERED_MODELS


@router.get("/{model_id}/drift")
async def get_model_drift_telemetry(model_id: str):
    """Retrieve statistical data and concept drift metrics for an ML model."""
    found = next((m for m in _REGISTERED_MODELS if m["model_id"] == model_id), None)
    if not found:
        raise HTTPException(status_code=404, detail="Model not registered")

    return {
        "model_id": model_id,
        "name": found["name"],
        "version": found["version"],
        "drift_status": found["drift_status"],
        "p_value_ks_test": 0.24,
        "population_stability_index_psi": 0.08,
        "status": "No retraining needed" if found["drift_status"] == "in_bounds" else "Scheduled for next cycle",
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }
