import pytest
from app.decision.dispatch import dispatch_decision_service

def test_dispatch_decision():
    incidents = [{'incident_id': 'inc_1', 'hazard_type': 'flood', 'severity': 4, 'latitude': 19.05, 'longitude': 72.85}]
    responders = [{'unit_id': 'u1', 'name': 'SAR Unit', 'unit_type': 'search_and_rescue', 'latitude': 19.06, 'longitude': 72.86, 'status': 'available'}]
    dispatch = dispatch_decision_service.optimize_dispatch(incidents, responders)
    assert dispatch is not None
    assert 'assignments' in dispatch
