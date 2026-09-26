from __future__ import annotations

class EvacuationConstraints:
    def check_road_throughput(self, hourly_flow: int, max_capacity: int = 1200) -> bool:
        return hourly_flow <= max_capacity
