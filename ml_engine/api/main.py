"""FastAPI main entrypoint for ML Engine."""
from __future__ import annotations
from fastapi import FastAPI
from .hazard import router as hazard_router
from .forecasting import router as forecasting_router
from .anomaly import router as anomaly_router
from .vision import router as vision_router
from .geospatial import router as geospatial_router
from .nlp import router as nlp_router
from .optimization import router as optimization_router

app = FastAPI(
    title="Disaster Management Platform - ML Engine API",
    version="1.0.0",
    description="Production ML services for multi-hazard prediction, forecasting, anomaly detection, CV, and emergency logistics."
)

app.include_router(hazard_router)
app.include_router(forecasting_router)
app.include_router(anomaly_router)
app.include_router(vision_router)
app.include_router(geospatial_router)
app.include_router(nlp_router)
app.include_router(optimization_router)

@app.get("/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ml_engine_api"}
