from __future__ import annotations

class ShelterAllocationModel:
    def __init__(self, capacities: dict[str, int]) -> None:
        self.capacities = capacities
