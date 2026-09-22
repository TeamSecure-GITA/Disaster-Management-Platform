import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_incident_lifecycle():
    # 1. Create incident
    c_resp = client.post('/api/v1/incidents', json={
        'title': 'Bridge Washout Threat',
        'hazard_type': 'flood',
        'severity': 4,
        'latitude': 19.08,
        'longitude': 72.88,
        'casualty_count': 3,
        'critical_infrastructure_threatened': True,
    })
    assert c_resp.status_code == 201
    inc_id = c_resp.json()['incident_id']

    # 2. Get incident by ID
    g_resp = client.get(f'/api/v1/incidents/{inc_id}')
    assert g_resp.status_code == 200
    assert g_resp.json()['incident_id'] == inc_id

    # 3. Update status
    u_resp = client.patch(f'/api/v1/incidents/{inc_id}/status?new_status=in_progress')
    assert u_resp.status_code == 200
    assert u_resp.json()['status'] == 'in_progress'
