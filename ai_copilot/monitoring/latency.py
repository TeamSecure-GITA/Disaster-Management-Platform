import time
from typing import Dict, Any

class LatencyTracker:
    def __init__(self):
        self.checkpoints: Dict[str, float] = {}

    def start(self, name: str):
        self.checkpoints[name] = time.time()

    def stop(self, name: str) -> float:
        if name in self.checkpoints:
            duration = (time.time() - self.checkpoints[name]) * 1000.0
            del self.checkpoints[name]
            return round(duration, 2)
        return 0.0
