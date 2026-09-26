from __future__ import annotations
from src.optimization.route_optimization import RouteOptimizer

def test_route_optimization():
    opt = RouteOptimizer()
    res = opt.find_safest_route("A", "C")
    assert res["distance_km"] < float('inf')
    assert "route" in res
