import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root():
    resp = client.get('/')
    assert resp.status_code == 200
    data = resp.json()
    assert data['status'] == 'operational'

def test_api_health():
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.json()['status'] == 'healthy'

def test_api_system_info():
    resp = client.get('/system/info')
    assert resp.status_code == 200
    assert 'capabilities' in resp.json()
