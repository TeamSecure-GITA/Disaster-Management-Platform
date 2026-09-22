import pytest
from app.api.v1.prediction.multi_hazard import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_multi_hazard():
    resp = client.post('/multi-hazard/predict', json={'primary_hazard': 'cyclone', 'wind_speed_kmh': 90.0})
    assert resp.status_code == 200
