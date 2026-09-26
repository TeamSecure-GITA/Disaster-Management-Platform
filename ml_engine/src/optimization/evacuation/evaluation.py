from __future__ import annotations

class EvacuationEvaluator:
    def calculate_total_clearance_time(self, departure_times: dict[str, int]) -> int:
        return max(departure_times.values(), default=0) + 60
