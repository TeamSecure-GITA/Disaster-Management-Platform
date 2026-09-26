from __future__ import annotations

class ResourceAllocationOptimizer:
    def allocate(self, demands: dict[str, int], stock: int) -> dict[str, int]:
        total_demand = sum(demands.values()) or 1
        return {k: int((v / total_demand) * stock) for k, v in demands.items()}
