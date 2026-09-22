import pytest
from app.decision.resources import resource_decision_service

def test_resource_decision():
    depots = [{'depot_id': 'd1', 'inventory': {'potable_water_liters': 5000}}]
    demands = [{'demand_id': 'req1', 'destination_id': 'siteA', 'category': 'water', 'quantity_needed': 500}]
    alloc = resource_decision_service.allocate_resources(depots, demands)
    assert alloc is not None
    assert 'transfers' in alloc
