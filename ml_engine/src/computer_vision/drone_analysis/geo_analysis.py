from __future__ import annotations

class DroneGeoAnalyzer:
    def project_pixel_to_gps(self, pixel_coord: tuple[int, int], drone_telemetry: dict) -> tuple[float, float]:
        lat = drone_telemetry.get("latitude", 0.0)
        lon = drone_telemetry.get("longitude", 0.0)
        return (lat, lon)
