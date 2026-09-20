"""
Weather and meteorological tools.

No weather values are fabricated here. A real weather provider must be
connected before current/forecast values are returned.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class WeatherTools:
    """Weather information tools."""

    def __init__(self, weather_service: Any = None):
        self.weather_service = weather_service

    async def current_weather(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """Get current weather for a coordinate."""

        if self.weather_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "current_weather",
                "message": "Weather provider is not connected.",
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
            }

        try:
            weather = await self.weather_service.current(
                latitude=latitude,
                longitude=longitude,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "current_weather",
                "weather": weather,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def forecast(
        self,
        latitude: float,
        longitude: float,
        hours: int = 24,
    ) -> Dict[str, Any]:
        """Get weather forecast."""

        hours = max(1, min(hours, 240))

        if self.weather_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "weather_forecast",
                "message": "Weather provider is not connected.",
                "hours": hours,
            }

        try:
            forecast = await self.weather_service.forecast(
                latitude=latitude,
                longitude=longitude,
                hours=hours,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "weather_forecast",
                "forecast": forecast,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def rainfall(
        self,
        latitude: float,
        longitude: float,
        hours: int = 24,
    ) -> Dict[str, Any]:
        """Retrieve rainfall information."""

        if self.weather_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "rainfall",
                "message": "Weather provider is not connected.",
            }

        try:
            result = await self.weather_service.rainfall(
                latitude=latitude,
                longitude=longitude,
                hours=hours,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "rainfall",
                "rainfall": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "weather_tools",
            "status": "connected" if self.weather_service else "not_connected",
        }