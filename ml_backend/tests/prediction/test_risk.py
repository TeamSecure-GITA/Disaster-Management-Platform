import pytest
from app.api.v1.prediction.risk import router
from fastapi.testclient import TestClient
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

def test_api_assess_risk():
    resp = client.post('/risk/assess', json={
        'hazard_type': 'flood',
        'hazard_intensity': 0.85,
        'population_density_per_km2': 2500.0,
        'building_vulnerability_score': 0.6,
        'institutional_coping_capacity': 0.6
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data['success'] is True
    assert 'risk_score' in data
    assert 'risk_level' in data
