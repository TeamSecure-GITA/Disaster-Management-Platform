"""
Background Prediction Worker.
Periodically re-scores hazard vulnerabilities and runs batch ML inference.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.ml.models.landslide.model import LandslideModel
from app.ml.models.landslide.inference import LandslideInferenceEngine
from app.ml.models.flood.model import FloodModel
from app.ml.models.flood.inference import FloodInferenceEngine

logger = logging.getLogger("workers.prediction")


class PredictionWorker:
    """Asynchronous worker executing periodic hazard risk recalculations."""

    def __init__(self, interval_seconds: int = 60):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._last_run: Optional[str] = None
        self._execution_count = 0

        self.landslide_engine = LandslideInferenceEngine(LandslideModel())
        self.flood_engine = FloodInferenceEngine(FloodModel())

    async def run_once(self) -> Dict[str, Any]:
        """Runs a single prediction calculation cycle across active hazard sectors."""
        self._execution_count += 1
        now = datetime.now(timezone.utc).isoformat()
        self._last_run = now

        logger.info("Executing prediction worker cycle #%d at %s", self._execution_count, now)

        # Batch prediction sample across active sectors
        sample_sectors = [
            {"sector_id": "north_ridge", "rainfall_24h_mm": 110.0, "slope_angle_deg": 28.0},
            {"sector_id": "river_valley", "river_water_level_m": 4.5, "rainfall_intensity_mm_h": 25.0},
        ]

        results = []
        for s in sample_sectors:
            if "slope_angle_deg" in s:
                pred = self.landslide_engine.predict(s)
            else:
                pred = self.flood_engine.predict(s)
            results.append({"sector": s.get("sector_id"), "status": pred.status, "risk": pred.risk_score})

        return {
            "execution_id": self._execution_count,
            "timestamp": now,
            "evaluated_sectors": len(results),
            "results": results,
        }

    async def start(self) -> None:
        """Starts the background worker loop."""
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        """Stops the background worker loop."""
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _loop(self) -> None:
        while self.is_running:
            try:
                await self.run_once()
            except Exception as exc:
                logger.exception("Error in prediction worker loop: %s", exc)
            await asyncio.sleep(self.interval_seconds)


prediction_worker = PredictionWorker()
