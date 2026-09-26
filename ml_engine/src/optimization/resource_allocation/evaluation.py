from __future__ import annotations

class ResourceAllocationEvaluator:
    def evaluate_fulfillment_ratio(self, demands: dict[str, int], allocated: dict[str, int]) -> float:
        tot_d = sum(demands.values()) or 1
        tot_a = sum(allocated.values())
        return min(1.0, tot_a / tot_d)
