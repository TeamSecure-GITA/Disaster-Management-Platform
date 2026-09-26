from context_manager.incident_context import IncidentContextTracker
from schemas.context import IncidentContext

def test_incident_context():
    tracker = IncidentContextTracker()
    ctx = IncidentContext()
    updated = tracker.update_incident(ctx, "INC-999", severity="critical")
    assert updated.active_incident_id == "INC-999"
    assert updated.severity == "critical"
