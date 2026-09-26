from context_manager.location_context import LocationContextTracker
from schemas.context import LocationContext
from schemas.input import GeoPoint

def test_location_context():
    tracker = LocationContextTracker()
    ctx = LocationContext()
    updated = tracker.update_location(ctx, GeoPoint(latitude=18.52, longitude=73.85), zone="Sector 4")
    assert updated.current_location.latitude == 18.52
    assert "Sector 4" in updated.affected_zones
