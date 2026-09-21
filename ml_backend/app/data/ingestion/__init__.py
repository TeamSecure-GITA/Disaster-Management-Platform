"""
Ingestion sub-package.

Exposes one unified ``DataIngestionService`` facade and all individual
ingesters for direct use.
"""

from __future__ import annotations

from .citizen_reports import (
    CitizenReport,
    CitizenReportIngester,
    ReportChannel,
    ReportStatus,
    ReportType,
    UrgencyLevel,
)
from .drone import (
    DroneImageCapture,
    DroneIngester,
    DroneMission,
    DroneStatus,
    DroneTelemetry,
    MissionType,
)
from .historical import (
    DisasterCategory,
    HistoricalEvent,
    HistoricalIngester,
    HistoricalSource,
)
from .satellite import (
    BoundingBox,
    BandType,
    SatelliteIngester,
    SatelliteScene,
    SatelliteSource,
)
from .sensors import (
    SensorAlert,
    SensorIngester,
    SensorReading,
    SensorStatus,
    SensorType,
)
from .weather import (
    WeatherIngester,
    WeatherObservation,
    WeatherSource,
)


class DataIngestionService:
    """
    Unified facade for all data ingestion channels.

    Example::

        svc = DataIngestionService()
        weather_obs = svc.weather.fetch(lat=26.1, lon=91.7)
        sensor_obs = svc.sensors.ingest(payload)
        report = svc.citizen_reports.ingest(payload)
    """

    def __init__(
        self,
        weather_ingester: WeatherIngester | None = None,
        sensor_ingester: SensorIngester | None = None,
        satellite_ingester: SatelliteIngester | None = None,
        drone_ingester: DroneIngester | None = None,
        citizen_report_ingester: CitizenReportIngester | None = None,
        historical_ingester: HistoricalIngester | None = None,
    ):
        self.weather: WeatherIngester = weather_ingester or WeatherIngester()
        self.sensors: SensorIngester = sensor_ingester or SensorIngester()
        self.satellite: SatelliteIngester = satellite_ingester or SatelliteIngester()
        self.drone: DroneIngester = drone_ingester or DroneIngester()
        self.citizen_reports: CitizenReportIngester = (
            citizen_report_ingester or CitizenReportIngester()
        )
        self.historical: HistoricalIngester = historical_ingester or HistoricalIngester()

    def health(self) -> dict:
        return {
            "service": "data_ingestion",
            "status": "ok",
            "channels": [
                "weather",
                "sensors",
                "satellite",
                "drone",
                "citizen_reports",
                "historical",
            ],
        }


__all__ = [
    # Facade
    "DataIngestionService",
    # Weather
    "WeatherIngester",
    "WeatherObservation",
    "WeatherSource",
    # Sensors
    "SensorIngester",
    "SensorReading",
    "SensorAlert",
    "SensorType",
    "SensorStatus",
    # Satellite
    "SatelliteIngester",
    "SatelliteScene",
    "SatelliteSource",
    "BoundingBox",
    "BandType",
    # Drone
    "DroneIngester",
    "DroneTelemetry",
    "DroneImageCapture",
    "DroneMission",
    "DroneStatus",
    "MissionType",
    # Citizen reports
    "CitizenReportIngester",
    "CitizenReport",
    "ReportType",
    "ReportChannel",
    "ReportStatus",
    "UrgencyLevel",
    # Historical
    "HistoricalIngester",
    "HistoricalEvent",
    "HistoricalSource",
    "DisasterCategory",
]
