from __future__ import annotations
from src.optimization.resource_allocation import ResourceAllocationOptimizer

def test_resource_allocation():
    opt = ResourceAllocationOptimizer()
    alloc = opt.allocate({"Shelter1": 100, "Shelter2": 200}, stock=150)
    assert alloc["Shelter2"] >= alloc["Shelter1"]
