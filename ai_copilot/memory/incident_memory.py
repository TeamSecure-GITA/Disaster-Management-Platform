from typing import Dict, Any, Optional

class IncidentEpisodicMemory:
    def __init__(self):
        self._incidents: Dict[str, Dict[str, Any]] = {}

    def log_event(self, incident_id: str, event: Dict[str, Any]):
        if incident_id not in self._incidents:
            self._incidents[incident_id] = {"events": []}
        self._incidents[incident_id]["events"].append(event)

    def get_timeline(self, incident_id: str) -> list:
        return self._incidents.get(incident_id, {}).get("events", [])
