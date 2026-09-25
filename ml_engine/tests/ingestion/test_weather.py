from src.ingestion.weather import WeatherIngestion


def test_weather_ingestion():
    adapter = WeatherIngestion()
    raw = [
        {
            "timestamp": "2026-09-25T10:00:00Z",
            "lat": 23.5,
            "lon": 88.3,
            "temperature": 29.5,
            "humidity": 82.0,
            "pressure": 1008.0,
            "wind_speed": 18.0,
            "wind_direction": 140.0,
        }
    ]
    obs = adapter.ingest(raw)
    assert len(obs) == 1
    assert obs[0].source == "weather"
    assert obs[0].location["latitude"] == 23.5
    assert obs[0].location["longitude"] == 88.3
    assert obs[0].values["temperature"] == 29.5
    assert obs[0].values["humidity"] == 82.0
