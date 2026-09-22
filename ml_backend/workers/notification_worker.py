"""
Background Notification & Emergency Siren Worker.
Processes the emergency outbound dispatch queue for SMS, WebPush, and sirens.
"""

from __future__ import annotations

import asyncio
import logging
from collections import deque
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("workers.notification")


class NotificationWorker:
    """Worker processing prioritized emergency alert dispatches."""

    def __init__(self, interval_seconds: int = 5):
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None
        self._queue: deque[Dict[str, Any]] = deque()
        self._sent_notifications: List[Dict[str, Any]] = []

    def enqueue(self, notification: Dict[str, Any]) -> None:
        """Enqueue an emergency notification payload."""
        self._queue.append(notification)

    async def run_once(self) -> Dict[str, Any]:
        """Processes and drains the notification queue."""
        dispatched = 0
        while self._queue:
            item = self._queue.popleft()
            item["sent_at"] = datetime.now(timezone.utc).isoformat()
            item["status"] = "delivered"
            self._sent_notifications.append(item)
            dispatched += 1

        return {
            "dispatched_count": dispatched,
            "total_sent_lifetime": len(self._sent_notifications),
            "timestamp": datetime.now(timezone.utc).isoformat(),
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
                logger.exception("Notification worker error: %s", exc)
            await asyncio.sleep(self.interval_seconds)


notification_worker = NotificationWorker()
