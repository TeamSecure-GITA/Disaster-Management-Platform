from __future__ import annotations

class ResourceConstraints:
    def is_within_budget(self, allocations: dict[str, int], total_stock: int) -> bool:
        return sum(allocations.values()) <= total_stock
