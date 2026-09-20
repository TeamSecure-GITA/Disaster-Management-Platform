"""
Emergency shelter tools.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class ShelterTools:
    """Search and inspect emergency shelters."""

    def __init__(self, shelter_service: Any = None):
        self.shelter_service = shelter_service

    async def search_shelters(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: float = 10.0,
        capacity_required: Optional[int] = None,
        accessible_only: bool = False,
        open_only: bool = True,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Find shelters matching the supplied requirements."""

        if self.shelter_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "search_shelters",
                "message": "Shelter service is not connected.",
                "filters": {
                    "latitude": latitude,
                    "longitude": longitude,
                    "radius_km": radius_km,
                    "capacity_required": capacity_required,
                    "accessible_only": accessible_only,
                    "open_only": open_only,
                },
                "shelters": [],
            }

        try:
            shelters = await self.shelter_service.search(
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                capacity_required=capacity_required,
                accessible_only=accessible_only,
                open_only=open_only,
                limit=max(1, min(limit, 100)),
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "search_shelters",
                "shelters": shelters or [],
                "count": len(shelters or []),
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
                "shelters": [],
            }

    async def get_shelter(
        self,
        shelter_id: str,
    ) -> Dict[str, Any]:
        """Retrieve detailed shelter information."""

        if not shelter_id:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "shelter_id is required.",
            }

        if self.shelter_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "get_shelter",
                "message": "Shelter service is not connected.",
            }

        try:
            shelter = await self.shelter_service.get(shelter_id)

            if shelter is None:
                return {
                    "success": False,
                    "status": "not_found",
                    "shelter_id": shelter_id,
                }

            return {
                "success": True,
                "status": "ok",
                "tool": "get_shelter",
                "shelter": shelter,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def shelter_capacity(
        self,
        shelter_id: str,
    ) -> Dict[str, Any]:
        """Get current shelter capacity."""

        if self.shelter_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "shelter_capacity",
                "message": "Shelter service is not connected.",
            }

        try:
            capacity = await self.shelter_service.capacity(shelter_id)

            return {
                "success": True,
                "status": "ok",
                "tool": "shelter_capacity",
                "shelter_id": shelter_id,
                "capacity": capacity,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "shelter_tools",
            "status": "connected" if self.shelter_service else "not_connected",
        }