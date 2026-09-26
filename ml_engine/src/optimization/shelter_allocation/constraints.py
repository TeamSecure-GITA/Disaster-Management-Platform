from __future__ import annotations

class ShelterConstraints:
    def check_capacity(self, shelter_occupancy: dict[str, int], max_capacity: dict[str, int]) -> bool:
        for s, count in shelter_occupancy.items():
            if count > max_capacity.get(s, 0):
                return False
        return True
