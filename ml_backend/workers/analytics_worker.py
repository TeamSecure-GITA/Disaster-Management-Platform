"""
Background Analytics Aggregation & KPI Calculation Worker.
Rolls up telemetry windows, generates spatial density grids, and detects hazard trends.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.analytics.trends.hazard_trends import analyze_hazard_trends
from app.analytics.geospatial.spatial_analysis import calculate_spatial_density_grid

logger = logging.getLogger("workers.analytics")


class AnalyticsWorker:
    """Worker periodically recomputing spatial hotspot density and trend summaries."""

    def __init__(self, interval_seconds: int = 120):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._execution_count = 0

    async def run_once(self) -> Dict[str, Any]:
        self._execution_count += 1
        now = datetime.now(timezone.utc).isoformat()

        # Compute sample spatial density from recent incidents
        sample_incidents = [
            (19.076, 72.877),
            (19.080, 72.885),
            (19.120, 72.910),
            (19.065, 72.860),
        ]
        grid = calculate_spatial_density_grid(sample_incidents, grid_size=6)

        sample_hazards = [
            {"hazard_type": "flood", "severity_score": 0.7},
            {"hazard_type": "flood", "severity_score": 0.8},
            {"hazard_type": "landslide", "severity_score": 0.5},
        ]
        trends = analyze_hazard_trends(sample_hazards)

        return {
            "execution": self._execution_count,
            "timestamp": now,
            "grid_density_max": grid.get("max_density", 0),
            "trends_computed": list(trends.keys()),
        }

    async def start(self) -> None:
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
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
                logger.exception("Analytics worker error: %s", exc)
            await asyncio.sleep(self.interval_seconds)


analytics_worker = AnalyticsWorker()
