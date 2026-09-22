import pytest
from app.decision.shelters import shelter_decision_service

def test_shelter_decision():
    shelters = [{'shelter_id': 'sh1', 'capacity': 500, 'current_occupancy': 100, 'latitude': 19.0, 'longitude': 72.8}]
    groups = [{'group_id': 'g1', 'count': 50, 'latitude': 19.01, 'longitude': 72.81}]
    balanced = shelter_decision_service.balance_shelter_load(shelters, groups)
    assert balanced is not None
    assert 'assignments' in balanced
