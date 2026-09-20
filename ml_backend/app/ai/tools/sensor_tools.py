"""
IoT/geotechnical/environmental sensor tools.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class SensorTools:
    """Tools for sensor telemetry and health."""

    def __init__(self, sensor_service: Any = None):
        self.sensor_service = sensor_service

    async def sensor_status(
        self,
        sensor_id: Optional[str] = None,
        sensor_type: Optional[str] = None,
        location_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Return sensor health/status information."""

        if self.sensor_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "sensor_status",
                "message": "Sensor service is not connected.",
                "sensor_id": sensor_id,
                "sensor_type": sensor_type,
                "location_id": location_id,
            }

        try:
            result = await self.sensor_service.status(
                sensor_id=sensor_id,
                sensor_type=sensor_type,
                location_id=location_id,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "sensor_status",
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def get_telemetry(
        self,
        sensor_id: str,
        metric: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve sensor telemetry."""

        if not sensor_id:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "sensor_id is required.",
            }

        if self.sensor_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "get_telemetry",
                "message": "Sensor service is not connected.",
            }

        try:
            data = await self.sensor_service.telemetry(
                sensor_id=sensor_id,
                metric=metric,
                start_time=start_time,
                end_time=end_time,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "get_telemetry",
                "sensor_id": sensor_id,
                "metric": metric,
                "data": data,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def detect_anomaly(
        self,
        sensor_id: str,
        metric: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Run anomaly detection on sensor data."""

        if self.sensor_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "detect_anomaly",
                "message": "Sensor service is not connected.",
            }

        try:
            result = await self.sensor_service.detect_anomaly(
                sensor_id=sensor_id,
                metric=metric,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "detect_anomaly",
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "sensor_tools",
            "status": "connected" if self.sensor_service else "not_connected",
        }