from __future__ import annotations
import time

class LatencyTracker:
    def __init__(self) -> None:
        self.history = []
    def record(self, duration_ms: float) -> None:
        self.history.append(duration_ms)
