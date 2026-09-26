from __future__ import annotations

class RouteEvaluator:
    def evaluate_route_efficiency(self, planned_distance: float, optimal_distance: float) -> float:
        return optimal_distance / (planned_distance or 1.0)
