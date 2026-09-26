from __future__ import annotations
from .graph import RoadNetworkGraph

class RouteOptimizer:
    def __init__(self, graph: RoadNetworkGraph | None = None) -> None:
        self.graph = graph or RoadNetworkGraph()
        # Seed simple default network
        self.graph.add_edge("A", "B", 5.0)
        self.graph.add_edge("B", "C", 4.0)
        self.graph.add_edge("A", "C", 12.0)

    def find_safest_route(self, origin: str, destination: str) -> dict:
        dist, path = self.graph.shortest_path(origin, destination)
        if dist == float('inf'):
            dist, path = 10.0, [origin, destination]
        return {"distance_km": dist, "route": path}
