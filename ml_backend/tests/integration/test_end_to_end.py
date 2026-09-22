import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_end_to_end_disaster_response_cycle():
    # 1. Operational dashboard check
    dash = client.get('/api/v1/analytics/dashboard')
    assert dash.status_code == 200
    assert dash.json()['success'] is True

    # 2. Compound multi-hazard risk assessment
    risk = client.post('/api/v1/prediction/risk/assess', json={
        'hazard_type': 'cyclone_flood',
        'hazard_intensity': 0.8,
        'population_density_per_km2': 3200.0,
        'building_vulnerability_score': 0.7,
        'institutional_coping_capacity': 0.5
    })
    assert risk.status_code == 200
    assert risk.json()['recommended_alert_level'] in ('ORANGE', 'RED', 'YELLOW')

    # 3. Request resource allocation
    res = client.post('/api/v1/resources/allocate', json={
        'demands': [{'demand_id': 'e2e_req', 'destination_id': 'shelter_1', 'category': 'medical', 'quantity_needed': 25}]
    })
    assert res.status_code == 200
    assert res.json()['success'] is True

    # 4. Generate situation brief
    brief = client.post('/api/v1/ai/brief/generate', json={
        'headline': 'End-to-End Test Event Brief',
        'affected_areas': ['Downtown Sector', 'River Basin']
    })
    assert brief.status_code == 200
    assert brief.json()['success'] is True
