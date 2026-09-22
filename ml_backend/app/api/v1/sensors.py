"""
IoT Sensor Telemetry, Hardware Health, and Anomaly Stream Ingestion API router.
"""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.analytics.realtime.streams import stream_buffer
from app.ml.models.anomaly.detector import AnomalyDetector

router = APIRouter(prefix="/sensors", tags=["Operations - Sensors & Telemetry"])

_detector = AnomalyDetector()

_DEMO_SENSORS = {
    "sensor_rain_01": {"sensor_id": "sensor_rain_01", "type": "rain_gauge", "location": "Ridge Sector A", "latitude": 19.12, "longitude": 72.89, "battery_pct": 94, "status": "online", "last_reading": 12.5, "unit": "mm/h"},
    "sensor_river_01": {"sensor_id": "sensor_river_01", "type": "river_stage", "location": "Main Bridge Gauge", "latitude": 19.07, "longitude": 72.87, "battery_pct": 88, "status": "online", "last_reading": 4.8, "unit": "m"},
    "sensor_soil_01": {"sensor_id": "sensor_soil_01", "type": "soil_moisture", "location": "Slope Zone 3", "latitude": 19.14, "longitude": 72.92, "battery_pct": 79, "status": "online", "last_reading": 42.0, "unit": "%"},
}


class TelemetryIngestRequest(BaseModel):
    sensor_id: str = Field(..., description="Unique sensor node hardware identifier")
    metric_name: str = Field(..., description="Measurement type (rainfall_rate, water_level, soil_saturation)")
    value: float = Field(..., description="Observed numeric value")
    battery_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Remaining battery percentage")
    raw_payload: Optional[Dict[str, Any]] = Field(default_factory=dict)


class TelemetryIngestResponse(BaseModel):
    success: bool
    sensor_id: str
    is_anomaly: bool
    anomaly_score: float
    severity: str
    buffered: bool
    timestamp: str


@router.get("", response_model=List[Dict[str, Any]])
async def list_sensors():
    """List registered field telemetry sensors, communication health, and latest readings."""
    return list(_DEMO_SENSORS.values())


@router.post("/telemetry", response_model=TelemetryIngestResponse)
async def ingest_sensor_telemetry(request: TelemetryIngestRequest):
    """Ingest live field sensor telemetry data point, run anomaly checks, and push to realtime stream."""
    try:
        # Push to stream buffer
        stream_buffer.push(
            stream_id=request.sensor_id,
            metric=request.metric_name,
            value=request.value,
            metadata={"battery_pct": request.battery_pct, **request.raw_payload},
        )

        # Update sensor cache
        if request.sensor_id in _DEMO_SENSORS:
            _DEMO_SENSORS[request.sensor_id]["last_reading"] = request.value
            if request.battery_pct is not None:
                _DEMO_SENSORS[request.sensor_id]["battery_pct"] = request.battery_pct

        # Check anomaly using sliding window points
        history = [p["value"] for p in stream_buffer.get_latest(request.sensor_id, count=20)]
        anomaly_res = _detector.analyze_stream_point(
            metric_name=request.metric_name,
            value=request.value,
            history=history,
        )

        return TelemetryIngestResponse(
            success=True,
            sensor_id=request.sensor_id,
            is_anomaly=anomaly_res.is_anomaly,
            anomaly_score=anomaly_res.anomaly_score,
            severity=anomaly_res.severity,
            buffered=True,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Telemetry ingestion error: {exc}",
        )


@router.get("/{sensor_id}/history")
async def get_sensor_history(sensor_id: str, count: int = 50):
    """Retrieve the recent buffered telemetry points for a specific sensor node."""
    points = stream_buffer.get_latest(sensor_id, count=count)
    return {"sensor_id": sensor_id, "points": points, "total": len(points)}
