from __future__ import annotations
from .graph import RoadNetworkGraph

class RouteOptimizationModel:
    def __init__(self, graph: RoadNetworkGraph | None = None) -> None:
        self.graph = graph or RoadNetworkGraph()
