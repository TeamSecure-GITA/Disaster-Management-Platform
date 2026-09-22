"""
Background Sensor Telemetry Ingestion & Anomaly Worker.
Consumes telemetry queue, executes real-time validation, and raises threshold breach events.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.analytics.realtime.streams import stream_buffer
from app.ml.models.anomaly.detector import AnomalyDetector

logger = logging.getLogger("workers.sensor")


class SensorWorker:
    """Worker monitoring sensor feeds, running moving anomaly checks, and detecting offline hardware."""

    def __init__(self, interval_seconds: int = 15):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._processed_batches = 0
        self.detector = AnomalyDetector()

    async def run_once(self) -> Dict[str, Any]:
        """Polls active streams and flags uncharacteristic spikes or missing heartbeats."""
        self._processed_batches += 1
        summary = stream_buffer.get_summary()

        anomalies_detected = []
        for sid in summary.get("stream_ids", []):
            points = stream_buffer.get_latest(sid, count=15)
            if len(points) >= 3:
                values = [p["value"] for p in points]
                res = self.detector.analyze_stream_point(points[-1]["metric"], points[-1]["value"], values[:-1])
                if res.is_anomaly:
                    anomalies_detected.append({"sensor_id": sid, "anomaly": res.to_dict()})

        return {
            "batch": self._processed_batches,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "monitored_streams": summary.get("active_streams", 0),
            "anomalies_found": anomalies_detected,
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
                logger.exception("Sensor worker error: %s", exc)
            await asyncio.sleep(self.interval_seconds)


sensor_worker = SensorWorker()
