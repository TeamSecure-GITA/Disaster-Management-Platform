"""
Incident-related AI tools.

Responsible for:
- incident search
- incident lookup
- incident creation
- incident status
- incident summaries

Live persistence should be connected through the database/repository layer.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4


@dataclass
class Incident:
    """Normalized incident representation."""

    id: str
    hazard_type: str
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str = "unknown"
    status: str = "reported"
    source: str = "unknown"
    created_at: str = ""
    updated_at: str = ""


class IncidentTools:
    """
    Tools used by the disaster-management copilot for incident operations.

    The class accepts an optional incident_service. The service can later be
    connected to the database/repository layer without changing the AI layer.
    """

    def __init__(self, incident_service: Any = None):
        self.incident_service = incident_service

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()

    async def search_incidents(
        self,
        query: Optional[str] = None,
        hazard_type: Optional[str] = None,
        status: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Search incidents.

        Returns a structured response instead of fabricating incidents when
        no incident provider has been configured.
        """

        limit = max(1, min(limit, 100))

        if self.incident_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "search_incidents",
                "message": "Incident data service is not connected.",
                "filters": {
                    "query": query,
                    "hazard_type": hazard_type,
                    "status": status,
                    "latitude": latitude,
                    "longitude": longitude,
                    "radius_km": radius_km,
                },
                "incidents": [],
            }

        try:
            result = await self.incident_service.search(
                query=query,
                hazard_type=hazard_type,
                status=status,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                limit=limit,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "search_incidents",
                "incidents": result or [],
                "count": len(result or []),
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "tool": "search_incidents",
                "message": str(exc),
                "incidents": [],
            }

    async def get_incident(
        self,
        incident_id: str,
    ) -> Dict[str, Any]:
        """Retrieve one incident by ID."""

        if not incident_id:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "incident_id is required.",
            }

        if self.incident_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "get_incident",
                "message": "Incident data service is not connected.",
                "incident_id": incident_id,
            }

        try:
            incident = await self.incident_service.get(incident_id)

            if incident is None:
                return {
                    "success": False,
                    "status": "not_found",
                    "incident_id": incident_id,
                }

            return {
                "success": True,
                "status": "ok",
                "tool": "get_incident",
                "incident": incident,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def create_incident(
        self,
        hazard_type: str,
        title: str,
        description: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        severity: str = "unknown",
        source: str = "copilot",
    ) -> Dict[str, Any]:
        """
        Create an incident.

        Actual creation should be protected by authentication and, where
        appropriate, explicit human confirmation.
        """

        if not hazard_type or not title:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "hazard_type and title are required.",
            }

        payload = {
            "hazard_type": hazard_type,
            "title": title,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "severity": severity,
            "source": source,
        }

        if self.incident_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "create_incident",
                "message": "Incident persistence service is not connected.",
                "would_create": payload,
                "requires_confirmation": True,
            }

        try:
            incident = await self.incident_service.create(payload)

            return {
                "success": True,
                "status": "created",
                "tool": "create_incident",
                "incident": incident,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def incident_summary(
        self,
        incident_id: str,
    ) -> Dict[str, Any]:
        """Return a concise incident summary."""

        result = await self.get_incident(incident_id)

        if not result.get("success"):
            return result

        incident = result.get("incident", {})

        return {
            "success": True,
            "status": "ok",
            "tool": "incident_summary",
            "summary": {
                "id": incident.get("id"),
                "hazard_type": incident.get("hazard_type"),
                "title": incident.get("title"),
                "severity": incident.get("severity"),
                "status": incident.get("status"),
                "location": {
                    "latitude": incident.get("latitude"),
                    "longitude": incident.get("longitude"),
                },
                "source": incident.get("source"),
                "created_at": incident.get("created_at"),
                "updated_at": incident.get("updated_at"),
            },
        }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "incident_tools",
            "status": "connected" if self.incident_service else "not_connected",
        }