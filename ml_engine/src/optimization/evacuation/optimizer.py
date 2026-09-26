from __future__ import annotations

class EvacuationOptimizer:
    def optimize_departure_schedule(self, zone_populations: dict[str, int]) -> dict[str, int]:
        # Return departure time in minutes from T=0
        sorted_zones = sorted(zone_populations.keys(), key=lambda z: zone_populations[z], reverse=True)
        return {z: idx * 15 for idx, z in enumerate(sorted_zones)}
