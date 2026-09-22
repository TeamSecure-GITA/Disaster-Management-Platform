"""
Background Report Generation Worker.
Generates automated operational briefings (SITREP) and situation digests on schedule.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.ai.generation.situation_brief import SituationBriefGenerator

logger = logging.getLogger("workers.report")


class ReportWorker:
    """Worker periodically generating operational situation briefs for command staff."""

    def __init__(self, interval_seconds: int = 3600):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._reports_generated = 0
        self.generator = SituationBriefGenerator()

    async def run_once(self) -> Dict[str, Any]:
        self._reports_generated += 1
        now = datetime.now(timezone.utc).isoformat()

        brief = self.generator.generate(
            headline=f"Periodic Operational SITREP #{self._reports_generated}",
            hazards=[{"hazard": "flood", "status": "active"}],
            incidents=[{"id": "inc_001", "status": "responding"}],
            affected_areas=["Sector 4", "East Catchment"],
            response_status="active_mobilization",
            critical_actions=["Monitor downstream river stage", "Prepare Shelter 2 overflow"],
        )

        return {
            "report_id": brief.brief_id,
            "generated_at": now,
            "headline": brief.headline,
            "summary_len": len(brief.situation),
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
                logger.exception("Report worker error: %s", exc)
            await asyncio.sleep(self.interval_seconds)


report_worker = ReportWorker()
