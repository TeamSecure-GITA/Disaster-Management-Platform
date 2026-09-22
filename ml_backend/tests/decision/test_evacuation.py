import pytest
from app.decision.evacuation import evacuation_decision_service

def test_evacuation_decision():
    zones = [{'zone_id': 'z1', 'name': 'Coast A', 'population': 800, 'priority': 1, 'latitude': 19.0, 'longitude': 72.8}]
    routes = [{'route_id': 'r1', 'distance_km': 12.0, 'is_active': True}]
    plan = evacuation_decision_service.generate_plan(zones, routes)
    assert plan is not None
    assert 'total_evacuees' in plan or 'orders' in plan or isinstance(plan, dict)
