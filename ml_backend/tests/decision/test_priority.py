import pytest
from app.decision.priority import priority_decision_service

def test_priority_decision():
    incidents = [
        {'incident_id': 'inc_1', 'severity': 2, 'casualty_count': 0},
        {'incident_id': 'inc_2', 'severity': 5, 'casualty_count': 10, 'critical_infrastructure_threatened': True}
    ]
    ranked = priority_decision_service.rank_incidents_by_priority(incidents)
    assert len(ranked) == 2
    assert ranked[0]['incident_id'] == 'inc_2'
    assert ranked[0]['triage_rank'] == 1
