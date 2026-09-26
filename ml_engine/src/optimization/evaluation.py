"""Optimization solution quality evaluator."""
from __future__ import annotations

class OptimizationEvaluator:
    def compute_optimality_gap(self, best_known_bound: float, current_solution_cost: float) -> float:
        if best_known_bound == 0:
            return 0.0
        return abs(current_solution_cost - best_known_bound) / best_known_bound
