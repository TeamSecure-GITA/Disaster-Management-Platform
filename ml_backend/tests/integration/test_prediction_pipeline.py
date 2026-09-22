import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_prediction_pipeline_e2e():
    # 1. Predict rainfall
    rf_resp = client.post('/api/v1/forecast/rainfall/predict', json={'current_intensity_mm_h': 35.0, 'horizon_hours': 6})
    assert rf_resp.status_code == 200
    cum_rain = rf_resp.json()['cumulative_forecast_mm']

    # 2. Feed into flood model
    flood_resp = client.post('/api/v1/prediction/flood/predict', json={'river_water_level_m': 4.8, 'rainfall_accumulated_24h_mm': cum_rain})
    assert flood_resp.status_code == 200
    assert 'model_name' in flood_resp.json()
