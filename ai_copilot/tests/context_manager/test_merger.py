from schemas.context import UnifiedContext
from context_manager.context_merger import ContextMerger

def test_context_merger_basic():
    merger = ContextMerger()
    ctx = UnifiedContext(session_id="session_merger_test")

    payload = {
        "location": {"latitude": 25.5788, "longitude": 91.8933, "address": "Shillong Sector 1"},
        "disaster": {"severity": "CRITICAL", "hazard_type": "landslide"}
    }

    merged = merger.merge(ctx, payload)
    assert merged.location.latitude == 25.5788
    assert merged.location.longitude == 91.8933
    assert merged.disaster.hazard_type == "landslide"
