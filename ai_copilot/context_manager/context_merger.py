from schemas.context import UnifiedContext
from schemas.input import GeoPoint

class ContextMerger:
    def merge(self, base: UnifiedContext, incoming_payload: dict) -> UnifiedContext:
        if "location" in incoming_payload and incoming_payload["location"]:
            loc_data = incoming_payload["location"]
            if isinstance(loc_data, dict):
                base.location.current_location = GeoPoint(**loc_data)
        if "incident_id" in incoming_payload:
            base.incident.active_incident_id = incoming_payload["incident_id"]
        if "role" in incoming_payload:
            base.user.role = incoming_payload["role"]
        return base
