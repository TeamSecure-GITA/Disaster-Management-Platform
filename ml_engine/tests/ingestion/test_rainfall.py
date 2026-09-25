from src.ingestion.rainfall import RainfallIngestion


def test_rainfall_ingestion():
    adapter = RainfallIngestion()
    raw = [
        {
            "timestamp": "2026-09-25T11:00:00Z",
            "latitude": 27.2,
            "longitude": 88.5,
            "rainfall_mm": 45.2,
            "duration_hours": 3.0,
            "intensity": 15.06,
        }
    ]
    obs = adapter.ingest(raw)
    assert len(obs) == 1
    assert obs[0].source == "rainfall"
    assert obs[0].values["rainfall_mm"] == 45.2
    assert obs[0].values["duration_hours"] == 3.0
