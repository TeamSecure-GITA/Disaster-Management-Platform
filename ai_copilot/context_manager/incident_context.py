from typing import Optional, Dict, Any
from schemas.context import IncidentContext

class IncidentContextTracker:
    def update_incident(self, context: IncidentContext, incident_id: str, severity: str = "high") -> IncidentContext:
        context.active_incident_id = incident_id
        context.severity = severity
        return context
