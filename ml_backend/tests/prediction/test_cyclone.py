import pytest
from app.api.v1.prediction.cyclone import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_cyclone():
    resp = client.post('/cyclone/predict', json={'central_pressure_hpa': 950.0, 'max_sustained_wind_knots': 85.0})
    assert resp.status_code == 200
    data = resp.json()
    assert 'model_name' in data
