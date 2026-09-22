"""
Realtime telemetry data stream manager and buffer processing.
Handles sliding window telemetry queues and subscriber streaming.
"""

from __future__ import annotations

import asyncio
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Set


@dataclass
class TelemetryStreamPoint:
    stream_id: str
    metric: str
    value: float
    timestamp: float
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stream_id": self.stream_id,
            "metric": self.metric,
            "value": self.value,
            "timestamp": self.timestamp,
            "iso_time": datetime.fromtimestamp(self.timestamp, tz=timezone.utc).isoformat(),
            "metadata": self.metadata,
        }


class TelemetryStreamBuffer:
    """Bounded circular buffer storing latest points per stream with listener hooks."""

    def __init__(self, maxlen: int = 1000):
        self.maxlen = maxlen
        self._buffers: Dict[str, deque[TelemetryStreamPoint]] = {}
        self._listeners: Set[Callable[[TelemetryStreamPoint], None]] = set()

    def push(self, stream_id: str, metric: str, value: float, metadata: Optional[Dict[str, Any]] = None) -> TelemetryStreamPoint:
        import time
        if stream_id not in self._buffers:
            self._buffers[stream_id] = deque(maxlen=self.maxlen)

        point = TelemetryStreamPoint(
            stream_id=stream_id,
            metric=metric,
            value=value,
            timestamp=time.time(),
            metadata=metadata or {},
        )
        self._buffers[stream_id].append(point)

        for listener in list(self._listeners):
            try:
                listener(point)
            except Exception:
                pass
        return point

    def get_latest(self, stream_id: str, count: int = 50) -> List[Dict[str, Any]]:
        buf = self._buffers.get(stream_id, deque())
        points = list(buf)[-count:]
        return [p.to_dict() for p in points]

    def subscribe(self, callback: Callable[[TelemetryStreamPoint], None]) -> None:
        self._listeners.add(callback)

    def unsubscribe(self, callback: Callable[[TelemetryStreamPoint], None]) -> None:
        self._listeners.discard(callback)

    def get_summary(self) -> Dict[str, Any]:
        return {
            "active_streams": len(self._buffers),
            "stream_ids": list(self._buffers.keys()),
            "total_buffered_points": sum(len(b) for b in self._buffers.values()),
        }


stream_buffer = TelemetryStreamBuffer()
