"""
Analytics tools for the AI copilot.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class AnalyticsTools:
    """Tools for dashboards, KPIs, trends and model metrics."""

    def __init__(self, analytics_service: Any = None):
        self.analytics_service = analytics_service

    async def dashboard(
        self,
        region: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve dashboard analytics."""

        if self.analytics_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "dashboard",
                "message": "Analytics service is not connected.",
            }

        try:
            result = await self.analytics_service.dashboard(
                region=region,
                start_time=start_time,
                end_time=end_time,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "dashboard",
                "data": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def trends(
        self,
        metric: str,
        region: Optional[str] = None,
        period: str = "24h",
    ) -> Dict[str, Any]:
        """Retrieve historical/current trends."""

        if not metric:
            return {
                "success": False,
                "status": "invalid_request",
                "message": "metric is required.",
            }

        if self.analytics_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "trends",
                "message": "Analytics service is not connected.",
            }

        try:
            result = await self.analytics_service.trends(
                metric=metric,
                region=region,
                period=period,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "trends",
                "metric": metric,
                "data": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def kpis(
        self,
        region: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve disaster-management KPIs."""

        if self.analytics_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "kpis",
                "message": "Analytics service is not connected.",
            }

        try:
            result = await self.analytics_service.kpis(region=region)

            return {
                "success": True,
                "status": "ok",
                "tool": "kpis",
                "data": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    async def model_metrics(
        self,
        model_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve ML model performance metrics."""

        if self.analytics_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "model_metrics",
                "message": "Analytics service is not connected.",
            }

        try:
            result = await self.analytics_service.model_metrics(
                model_name=model_name
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "model_metrics",
                "data": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "message": str(exc),
            }

    def health(self) -> Dict[str, Any]:
        return {
            "service": "analytics_tools",
            "status": "connected" if self.analytics_service else "not_connected",
        }