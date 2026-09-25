from src.ingestion.satellite import SatelliteIngestion


def test_satellite_ingestion():
    adapter = SatelliteIngestion()
    raw = [
        {
            "timestamp": "2026-09-25T12:00:00Z",
            "latitude": 27.5,
            "longitude": 88.6,
            "ndvi": 0.65,
            "ndwi": 0.22,
            "surface_temperature": 24.5,
            "elevation": 1450.0,
            "satellite": "Sentinel-2",
        }
    ]
    obs = adapter.ingest(raw)
    assert len(obs) == 1
    assert obs[0].values["ndvi"] == 0.65
    assert obs[0].metadata["satellite"] == "Sentinel-2"
