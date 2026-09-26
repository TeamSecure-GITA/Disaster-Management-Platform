from __future__ import annotations
from src.optimization.evacuation import EvacuationOptimizer

def test_evacuation_optimization():
    opt = EvacuationOptimizer()
    sched = opt.optimize_departure_schedule({"ZoneA": 5000, "ZoneB": 2000})
    assert "ZoneA" in sched
    assert sched["ZoneA"] < sched["ZoneB"]
