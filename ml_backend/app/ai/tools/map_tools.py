"""
Geospatial/map tools.

The map layer can later be connected to:
- OpenStreetMap
- Mapbox
- Google Maps
- GIS/PostGIS
- routing engines
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class MapTools:
    """Geospatial operations for the AI copilot."""

    def __init__(self, map_service: Any = None):
        self.map_service = map_service

    async def geocode(
        self,
        location: str,
    ) -> Dict[str, Any]:
        """Convert a place name/address into coordinates."""

        if not location:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "location is required.",
            }

        if self.map_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "geocode",
                "message": "Map/geocoding service is not connected.",
                "location": location,
            }

        try:
            result = await self.map_service.geocode(location)

            return {
                "success": True,
                "status": "ok",
                "tool": "geocode",
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def reverse_geocode(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """Convert coordinates into a human-readable location."""

        if self.map_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "reverse_geocode",
                "message": "Map service is not connected.",
            }

        try:
            result = await self.map_service.reverse_geocode(
                latitude,
                longitude,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "reverse_geocode",
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float],
        avoid_hazards: bool = False,
    ) -> Dict[str, Any]:
        """Calculate a route between two coordinates."""

        if self.map_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "route",
                "message": "Routing service is not connected.",
                "origin": origin,
                "destination": destination,
                "avoid_hazards": avoid_hazards,
            }

        try:
            result = await self.map_service.route(
                origin=origin,
                destination=destination,
                avoid_hazards=avoid_hazards,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "route",
                "route": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def nearby(
        self,
        latitude: float,
        longitude: float,
        category: str,
        radius_km: float = 10.0,
    ) -> Dict[str, Any]:
        """Find nearby geographic features or services."""

        if self.map_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "nearby",
                "message": "Map service is not connected.",
            }

        try:
            result = await self.map_service.nearby(
                latitude=latitude,
                longitude=longitude,
                category=category,
                radius_km=radius_km,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "nearby",
                "results": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "map_tools",
            "status": "connected" if self.map_service else "not_connected",
        }