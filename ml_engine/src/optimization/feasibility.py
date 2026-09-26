"""Solution feasibility verification."""
from __future__ import annotations
from typing import Any

class FeasibilityChecker:
    def is_feasible(self, solution: dict[str, Any], capacity_limits: dict[str, float]) -> bool:
        demand_counts: dict[str, float] = {}
        for src, dest in solution.items():
            demand_counts[dest] = demand_counts.get(dest, 0.0) + 1.0
        for dest, count in demand_counts.items():
            if count > capacity_limits.get(dest, float('inf')):
                return False
        return True
