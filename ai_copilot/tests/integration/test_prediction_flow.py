from fastapi.testclient import TestClient
from api.router import app

client = TestClient(app)

def test_prediction_flow():
    res = client.post("/api/v1/chat", json={"text": "Predict landslide probability for tomorrow in Mountain Sector"})
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "prediction"
