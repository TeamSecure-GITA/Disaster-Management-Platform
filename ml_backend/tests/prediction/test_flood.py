import pytest
from app.api.v1.prediction.flood import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_flood():
    resp = client.post('/flood/predict', json={'river_water_level_m': 4.5, 'rainfall_intensity_mm_h': 18.0})
    assert resp.status_code == 200
    data = resp.json()
    assert 'model_name' in data

def test_api_flood_info():
    resp = client.get('/flood/info')
    assert resp.status_code == 200
