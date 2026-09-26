from __future__ import annotations

class EmergencyTextModel:
    def parse(self, text: str) -> dict:
        return {"contains_location": True, "urgency": "IMMEDIATE"}
