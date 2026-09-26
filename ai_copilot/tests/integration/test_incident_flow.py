from fastapi.testclient import TestClient
from api.router import app

client = TestClient(app)

def test_incident_flow():
    res = client.post("/api/v1/chat", json={"text": "What is the status of active incident INC-101?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert data["confidence"] > 0
    assert data["intent"] == "incident"
