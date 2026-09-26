from __future__ import annotations

class ShelterAllocationOptimizer:
    def assign_evacuees(self, evacuee_groups: dict[str, int], capacities: dict[str, int]) -> dict[str, str]:
        assignments = {}
        shelter_keys = list(capacities.keys())
        if not shelter_keys:
            return {}
        for idx, grp in enumerate(evacuee_groups):
            assignments[grp] = shelter_keys[idx % len(shelter_keys)]
        return assignments
