"""Pydantic request and response schemas for ML Engine REST API."""
from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class HazardPredictionRequest(BaseModel):
    hazard_type: str = Field(..., examples=["landslide"])
    features: dict[str, float] = Field(default_factory=dict)
    location_id: str | None = None


class HazardPredictionResponse(BaseModel):
    hazard_type: str
    risk_probability: float
    severity: str
    prediction: int
    metadata: dict[str, Any] = Field(default_factory=dict)


class ForecastingRequest(BaseModel):
    series_type: str = Field(..., examples=["rainfall"])
    historical_values: list[float]
    horizon: int = 24


class ForecastingResponse(BaseModel):
    series_type: str
    forecast: list[float]
    unit: str


class AnomalyDetectionRequest(BaseModel):
    domain: str = Field(..., examples=["sensor"])
    telemetry: dict[str, float]


class AnomalyDetectionResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    domain: str


class VisionAnalysisRequest(BaseModel):
    image_base64: str | None = None
    task: str = "damage_detection"


class VisionAnalysisResponse(BaseModel):
    task: str
    detections: list[dict[str, Any]]
    confidence: float


class GeospatialAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    hazard_layers: list[str] = Field(default_factory=lambda: ["elevation", "slope"])


class GeospatialAnalysisResponse(BaseModel):
    latitude: float
    longitude: float
    risk_zone: str
    risk_score: float


class NLPAnalysisRequest(BaseModel):
    text: str
    task: str = "classification"


class NLPAnalysisResponse(BaseModel):
    task: str
    result: dict[str, Any]


class OptimizationRequest(BaseModel):
    scenario: str = "evacuation"
    inputs: dict[str, Any]


class OptimizationResponse(BaseModel):
    scenario: str
    solution: dict[str, Any]
    status: str
