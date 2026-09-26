from __future__ import annotations
from src.optimization.shelter_allocation import ShelterAllocationOptimizer

def test_shelter_allocation():
    opt = ShelterAllocationOptimizer()
    alloc = opt.assign_evacuees(["group1", "group2"], {"Shelter_A": 100})
    assert len(alloc) == 2
