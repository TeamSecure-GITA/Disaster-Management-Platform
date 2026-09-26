from __future__ import annotations

class EmergencyEntityExtractor:
    def extract_entities(self, text: str) -> list[str]:
        return ["WATER_PUMP", "MEDICAL_KIT"] if "need" in text.lower() else []
