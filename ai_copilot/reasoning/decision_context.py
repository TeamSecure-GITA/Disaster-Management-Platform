from typing import Dict, Any

class DecisionContext:
    def __init__(self, incident_severity: str = "high"):
        self.incident_severity = incident_severity

    def to_dict(self) -> Dict[str, Any]:
        return {"severity": self.incident_severity}
