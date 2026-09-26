from context_manager.context_merger import ContextMerger
from schemas.context import UnifiedContext

def test_context_merger():
    merger = ContextMerger()
    base = UnifiedContext(session_id="sess_1")
    merged = merger.merge(base, {"incident_id": "INC-123", "location": {"latitude": 12.3, "longitude": 45.6}})
    assert merged.incident.active_incident_id == "INC-123"
    assert merged.location.current_location.latitude == 12.3
