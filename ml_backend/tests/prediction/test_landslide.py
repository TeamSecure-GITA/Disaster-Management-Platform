import pytest
from app.api.v1.prediction.landslide import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_landslide():
    resp = client.post('/landslide/predict', json={'rainfall_24h_mm': 120.0, 'slope_angle_deg': 28.0})
    assert resp.status_code == 200
    data = resp.json()
    assert 'status' in data
    assert 'model_name' in data

def test_api_landslide_info():
    resp = client.get('/landslide/info')
    assert resp.status_code == 200
