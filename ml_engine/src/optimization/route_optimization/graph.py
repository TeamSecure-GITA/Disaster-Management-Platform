from __future__ import annotations
import heapq

class RoadNetworkGraph:
    def __init__(self) -> None:
        self.adj: dict[str, list[tuple[str, float]]] = {}

    def add_edge(self, u: str, v: str, weight: float) -> None:
        self.adj.setdefault(u, []).append((v, weight))
        self.adj.setdefault(v, []).append((u, weight))

    def shortest_path(self, start: str, end: str) -> tuple[float, list[str]]:
        pq = [(0.0, start, [start])]
        visited = set()
        while pq:
            d, node, path = heapq.heappop(pq)
            if node == end:
                return d, path
            if node in visited:
                continue
            visited.add(node)
            for neighbor, w in self.adj.get(node, []):
                if neighbor not in visited:
                    heapq.heappush(pq, (d + w, neighbor, path + [neighbor]))
        return float('inf'), []
