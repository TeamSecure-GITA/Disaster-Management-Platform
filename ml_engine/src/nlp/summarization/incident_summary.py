from __future__ import annotations

class IncidentSummarizer:
    def create_incident_bulletin(self, incident_type: str, casualties: int, location: str) -> str:
        return f"ALERT: {incident_type} reported at {location} with {casualties} reported casualties. First responders dispatched."
