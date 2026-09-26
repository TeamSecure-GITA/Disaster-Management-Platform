from __future__ import annotations

class RouteConstraints:
    def is_route_safe(self, path: list[str], blocked_edges: set[tuple[str, str]]) -> bool:
        for u, v in zip(path[:-1], path[1:]):
            if (u, v) in blocked_edges or (v, u) in blocked_edges:
                return False
        return True
