import pytest
from app.api.v1.prediction.earthquake import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_predict_earthquake():
    resp = client.post('/earthquake/predict', json={'magnitude': 6.2, 'hypocenter_depth_km': 12.0})
    assert resp.status_code == 200
