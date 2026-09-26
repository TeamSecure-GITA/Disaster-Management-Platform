from __future__ import annotations
from fastapi.testclient import TestClient
from api.main import app

def test_api_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_api_hazard_prediction():
    client = TestClient(app)
    payload = {"hazard_type": "landslide", "features": {"slope": 35.0, "rainfall": 120.0}}
    res = client.post("/hazard/predict", json=payload)
    assert res.status_code == 200
    assert "risk_probability" in res.json()
