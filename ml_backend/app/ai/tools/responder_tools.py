"""
Emergency responder and response-team tools.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class ResponderTools:
    """Tools for discovering and inspecting response teams."""

    def __init__(self, responder_service: Any = None):
        self.responder_service = responder_service

    async def search_responders(
        self,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: float = 25.0,
        responder_type: Optional[str] = None,
        availability: Optional[str] = "available",
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Find available emergency responders."""

        if self.responder_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "search_responders",
                "message": "Responder service is not connected.",
                "responders": [],
            }

        try:
            responders = await self.responder_service.search(
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                responder_type=responder_type,
                availability=availability,
                limit=max(1, min(limit, 100)),
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "search_responders",
                "responders": responders or [],
                "count": len(responders or []),
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
                "responders": [],
            }

    async def get_responder(
        self,
        responder_id: str,
    ) -> Dict[str, Any]:
        """Retrieve responder/team information."""

        if not responder_id:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "responder_id is required.",
            }

        if self.responder_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "get_responder",
                "message": "Responder service is not connected.",
            }

        try:
            responder = await self.responder_service.get(responder_id)

            return {
                "success": True,
                "status": "ok",
                "tool": "get_responder",
                "responder": responder,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def responder_status(
        self,
        responder_id: str,
    ) -> Dict[str, Any]:
        """Retrieve current responder status."""

        if self.responder_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "responder_status",
                "message": "Responder service is not connected.",
            }

        try:
            status = await self.responder_service.status(responder_id)

            return {
                "success": True,
                "status": "ok",
                "tool": "responder_status",
                "responder_id": responder_id,
                "responder_status": status,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "responder_tools",
            "status": "connected" if self.responder_service else "not_connected",
        }