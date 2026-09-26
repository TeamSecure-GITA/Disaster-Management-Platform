from __future__ import annotations

class ShelterAllocationEvaluator:
    def compute_overflow_count(self, shelter_occupancy: dict[str, int], max_capacity: dict[str, int]) -> int:
        overflow = 0
        for s, count in shelter_occupancy.items():
            if count > max_capacity.get(s, 0):
                overflow += count - max_capacity[s]
        return overflow
