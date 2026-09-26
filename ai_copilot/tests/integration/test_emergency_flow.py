from fastapi.testclient import TestClient
from api.router import app

client = TestClient(app)

def test_emergency_flow_confirmation():
    res = client.post("/api/v1/chat", json={"text": "Order immediate evacuation for Sector 3!"})
    assert res.status_code == 200
    data = res.json()
    assert data["requires_human_confirmation"] is True
