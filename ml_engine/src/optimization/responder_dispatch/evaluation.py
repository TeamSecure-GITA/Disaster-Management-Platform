from __future__ import annotations

class DispatchEvaluator:
    def average_response_time(self, response_times: list[float]) -> float:
        return sum(response_times) / (len(response_times) or 1)
