"""
Integration tests for the compatibility router bridging Express backend & Next.js/Vite frontend.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_chat_endpoint_emergency(client):
    """Verify emergency copilot endpoint returns clear instructions and hotline numbers."""
    payload = {
        "message": "There is a severe flash flood rising rapidly in my village. What should we do?",
        "context": "flood_evacuation",
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["fallback"] is False
    assert len(data["response"]) > 50
    # Must contain life-safety guidance or emergency hotlines
    text = data["response"].lower()
    assert any(term in text for term in ["flood", "evacuate", "high ground", "112", "emergency", "safety"])


def test_predict_endpoint_landslide(client):
    """Verify landslide prediction routing to operational Mohr-Coulomb model."""
    payload = {
        "disasterType": "landslide",
        "slope_angle_deg": 46.0,
        "rainfall_24h_mm": 240.0,
        "soil_moisture_pct": 89.0,
        "pore_water_pressure_kpa": 38.0,
        "location": {"type": "Point", "coordinates": [91.73, 25.27]},
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["disasterType"] == "landslide"
    assert 0.0 <= data["probability"] <= 1.0
    assert data["riskLevel"] in ("low", "medium", "high", "critical")
    assert len(data["recommendations"]) > 0
    assert "Mohr-Coulomb" in data["modelName"]


def test_predict_endpoint_flood(client):
    """Verify flood prediction routing to catchment inundation model."""
    payload = {
        "disasterType": "flood",
        "river_level_m": 5.4,
        "river_capacity_ratio": 0.92,
        "rainfall_24h_mm": 180.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["disasterType"] == "flood"
    assert 0.0 <= data["probability"] <= 1.0
    assert len(data["recommendations"]) > 0


def test_predict_endpoint_cyclone(client):
    """Verify cyclone prediction routing to storm surge model."""
    payload = {
        "disasterType": "cyclone",
        "wind_speed_kmh": 140.0,
        "central_pressure_hpa": 948.0,
        "storm_surge_m": 3.8,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["disasterType"] == "cyclone"
    assert 0.0 <= data["probability"] <= 1.0


def test_predict_endpoint_earthquake(client):
    """Verify earthquake ground motion prediction."""
    payload = {
        "disasterType": "earthquake",
        "magnitude": 6.8,
        "depth_km": 12.0,
        "epicentral_distance_km": 28.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["disasterType"] == "earthquake"


def test_predict_endpoint_wildfire(client):
    """Verify wildfire spread rate prediction."""
    payload = {
        "disasterType": "wildfire",
        "temperature_c": 41.0,
        "relative_humidity_pct": 14.0,
        "wind_speed_kmh": 45.0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["disasterType"] == "wildfire"


def test_predictions_landslide_frontend_contract(client):
    """Verify GET /predictions/landslide matches frontend LandslidePrediction contract."""
    response = client.get("/predictions/landslide")
    assert response.status_code == 200
    predictions = response.json()
    assert isinstance(predictions, list)
    assert len(predictions) >= 2

    first = predictions[0]
    assert "id" in first
    assert "location" in first
    assert "coordinates" in first["location"]
    assert "lat" in first["location"]["coordinates"]
    assert "lng" in first["location"]["coordinates"]
    assert "probability" in first
    assert "factorOfSafety" in first
    assert "riskLevel" in first
    assert first["riskLevel"] in ("VERY_LOW", "LOW", "MODERATE", "HIGH", "CRITICAL")
    assert "topFeatures" in first
    assert isinstance(first["topFeatures"], list)
    assert len(first["topFeatures"]) > 0


def test_predictions_forecast_timeline(client):
    """Verify GET /predictions/forecast produces 24h timeline."""
    response = client.get("/predictions/forecast?zoneId=zone-meghalaya-1")
    assert response.status_code == 200
    points = response.json()
    assert isinstance(points, list)
    assert len(points) >= 12

    p = points[0]
    assert "timestamp" in p
    assert "predictedProbability" in p
    assert "lowerConfidenceBound" in p
    assert "upperConfidenceBound" in p
    assert "triggerThreshold" in p
    assert "rainfallForecastMm" in p


def test_analytics_model_performance(client):
    """Verify GET /analytics/model-performance returns governance metrics."""
    response = client.get("/analytics/model-performance")
    assert response.status_code == 200
    metrics = response.json()
    assert isinstance(metrics, list)
    assert len(metrics) >= 4

    m = metrics[0]
    assert "modelName" in m
    assert "accuracy" in m
    assert "aucRoc" in m
    assert "f1Score" in m
    assert "inferenceLatencyMs" in m


def test_simulation_run(client):
    """Verify POST /simulation/run produces scenario impact step timeline."""
    payload = {
        "scenarioId": "cloudburst-monsoon-2026",
        "rainfallMultiplier": 2.2,
        "seismicMagnitude": 5.4,
        "soilSaturationInitialPct": 85.0,
        "riverDischargeRateCusecs": 3200.0,
        "durationHours": 24,
        "bridgeFailuresEnabled": True,
    }
    response = client.post("/simulation/run", json=payload)
    assert response.status_code == 200
    sim = response.json()
    assert "runId" in sim
    assert "scenarioName" in sim
    assert "steps" in sim
    assert len(sim["steps"]) >= 4

    step = sim["steps"][0]
    assert "timeStepHours" in step
    assert "affectedAreaSqKm" in step
    assert "projectedDisplacedCount" in step
    assert "inundationLevelMeters" in step
    assert "landslideProbabilities" in step

    assert "summary" in sim
    assert "peakCasualtyRisk" in sim["summary"]
    assert "safestEvacuationCorridors" in sim["summary"]
