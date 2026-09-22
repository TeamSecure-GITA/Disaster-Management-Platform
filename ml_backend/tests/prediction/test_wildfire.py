import pytest
from app.api.v1.prediction.wildfire import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_wildfire():
    resp = client.post('/wildfire/predict', json={'temperature_c': 35.0, 'wind_speed_kmh': 30.0})
    assert resp.status_code == 200
