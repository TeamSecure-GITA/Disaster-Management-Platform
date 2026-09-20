"""
Hazard prediction/inference tools.

Important:
Earthquake functionality is deliberately framed around detection,
characterization, hazard assessment or susceptibility—not deterministic
prediction of the exact time, location and magnitude of an earthquake.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


class PredictionTools:
    """Unified interface to disaster ML models."""

    SUPPORTED_HAZARDS = {
        "landslide",
        "flood",
        "cyclone",
        "earthquake",
        "wildfire",
        "multi_hazard",
    }

    def __init__(self, prediction_service: Any = None):
        self.prediction_service = prediction_service

    async def predict(
        self,
        hazard_type: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        features: Optional[Dict[str, Any]] = None,
        horizon_hours: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Run the configured hazard model."""

        hazard_type = (hazard_type or "").lower().strip()

        if hazard_type not in self.SUPPORTED_HAZARDS:
            return {
                "success": False,
                "status": "unsupported_hazard",
                "message": f"Unsupported hazard type: {hazard_type}",
                "supported_hazards": sorted(self.SUPPORTED_HAZARDS),
            }

        if self.prediction_service is None:
            return {
                "success": False,
                "status": "not_connected",
                "tool": "predict",
                "message": "Prediction service is not connected.",
                "hazard_type": hazard_type,
                "location": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "horizon_hours": horizon_hours,
            }

        try:
            result = await self.prediction_service.predict(
                hazard_type=hazard_type,
                latitude=latitude,
                longitude=longitude,
                features=features or {},
                horizon_hours=horizon_hours,
            )

            return {
                "success": True,
                "status": "ok",
                "tool": "predict",
                "hazard_type": hazard_type,
                "result": result,
            }

        except Exception as exc:
            return {
                "success": False,
                "status": "error",
                "tool": "predict",
                "message": str(exc),
            }

    async def landslide_prediction(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Landslide susceptibility/risk inference."""

        return await self.predict(
            hazard_type="landslide",
            latitude=latitude,
            longitude=longitude,
            features=features,
        )

    async def flood_prediction(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
        horizon_hours: int = 24,
    ) -> Dict[str, Any]:
        """Flood-risk inference."""

        return await self.predict(
            hazard_type="flood",
            latitude=latitude,
            longitude=longitude,
            features=features,
            horizon_hours=horizon_hours,
        )

    async def cyclone_prediction(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
        horizon_hours: int = 72,
    ) -> Dict[str, Any]:
        """Cyclone-related risk inference."""

        return await self.predict(
            hazard_type="cyclone",
            latitude=latitude,
            longitude=longitude,
            features=features,
            horizon_hours=horizon_hours,
        )

    async def earthquake_analysis(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Earthquake hazard/detection analysis.

        This does not claim deterministic earthquake prediction.
        """

        return await self.predict(
            hazard_type="earthquake",
            latitude=latitude,
            longitude=longitude,
            features=features,
        )

    async def wildfire_prediction(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
        horizon_hours: int = 24,
    ) -> Dict[str, Any]:
        """Wildfire risk inference."""

        return await self.predict(
            hazard_type="wildfire",
            latitude=latitude,
            longitude=longitude,
            features=features,
            horizon_hours=horizon_hours,
        )

    async def multi_hazard_prediction(
        self,
        latitude: float,
        longitude: float,
        features: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Multi-hazard risk inference."""

        return await self.predict(
            hazard_type="multi_hazard",
            latitude=latitude,
            longitude=longitude,
            features=features,
        )

    def health(self) -> Dict[str, Any]:
        return {
            "service": "prediction_tools",
            "status": "connected" if self.prediction_service else "not_connected",
            "supported_hazards": sorted(self.SUPPORTED_HAZARDS),
        }