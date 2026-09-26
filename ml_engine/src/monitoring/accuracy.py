from __future__ import annotations

class AccuracyMonitor:
    def compute_rolling_accuracy(self, matches: list[bool]) -> float:
        return sum(matches) / (len(matches) or 1)
