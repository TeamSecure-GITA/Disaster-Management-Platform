"""
Risk-analysis tools.

These tools provide a normalized interface to hazard-risk engines.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class RiskTools:
    """AI-accessible risk analysis tools."""

    def __init__(self, risk_engine: Any = None):
        self.risk_engine = risk_engine

    async def analyze_risk(
        self,
        latitude: Any = None,
        longitude: Optional[float] = None,
        hazard_type: Optional[str] = None,
        horizon_hours: Optional[int] = 24,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        """
        Analyze risk at a geographic point.

        The returned risk score must come from the configured risk engine.
        """
        if isinstance(latitude, dict):
            data = latitude
            latitude = data.get("latitude", 0.0)
            longitude = data.get("longitude", 0.0)
            hazard_type = data.get("hazard_type", hazard_type)
            horizon_hours = data.get("horizon_hours", horizon_hours)

        if latitude is None or longitude is None:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "latitude and longitude are required.",
            }

        if self.risk_engine is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "analyze_risk",
                "message": "Risk engine is not connected.",
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "hazard_type": hazard_type,
                "horizon_hours": horizon_hours,
            }

        try:
            result = await self.risk_engine.analyze(
                latitude=latitude,
                longitude=longitude,
                hazard_type=hazard_type,
                horizon_hours=horizon_hours,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "analyze_risk",
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "tool": "analyze_risk",
                "message": str(exc),
            }

    async def compare_risk(
        self,
        locations: list[Dict[str, float]],
        hazard_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Compare risk across multiple locations."""

        if not locations:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "At least one location is required.",
            }

        if self.risk_engine is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "compare_risk",
                "message": "Risk engine is not connected.",
                "locations": locations,
                "hazard_type": hazard_type,
            }

        try:
            results = []

            for location in locations:
                result = await self.risk_engine.analyze(
                    latitude=location["latitude"],
                    longitude=location["longitude"],
                    hazard_type=hazard_type,
                )

                results.append(
                    {
                        "location": location,
                        "result": result,
                    }
                )

            return {
                "success": True,
                "status": "ok",
                "tool": "compare_risk",
                "results": results,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def get_risk_factors(
        self,
        latitude: float,
        longitude: float,
        hazard_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve factors contributing to a risk assessment."""

        if self.risk_engine is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "get_risk_factors",
                "message": "Risk engine is not connected.",
            }

        try:
            result = await self.risk_engine.factors(
                latitude=latitude,
                longitude=longitude,
                hazard_type=hazard_type,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "get_risk_factors",
                "factors": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "risk_tools",
            "status": "connected" if self.risk_engine else "not_connected",
        }