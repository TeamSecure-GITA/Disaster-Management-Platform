from fastapi.testclient import TestClient
from api.router import app

client = TestClient(app)

def test_multimodal_flow():
    res = client.post("/api/v1/multimodal", json={
        "text": "Analyze flood hazard image",
        "images": [{"image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="}]
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
