import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_sensor_ingestion_and_anomaly_detection():
    resp = client.post('/api/v1/sensors/telemetry', json={
        'sensor_id': 'sensor_pipeline_test',
        'metric_name': 'river_stage',
        'value': 9.8,
        'battery_pct': 92.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data['buffered'] is True
    assert 'is_anomaly' in data
