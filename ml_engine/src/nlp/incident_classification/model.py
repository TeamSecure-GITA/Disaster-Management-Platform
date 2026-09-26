from __future__ import annotations
from .labels import IncidentLabel

class IncidentClassificationModel:
    def predict_category(self, text: str) -> IncidentLabel:
        low = text.lower()
        if "fire" in low:
            return IncidentLabel.FIRE_OUTBREAK
        elif "water" in low or "flood" in low:
            return IncidentLabel.FLOOD_INUNDATION
        elif "injur" in low or "doctor" in low or "hospital" in low:
            return IncidentLabel.MEDICAL_EMERGENCY
        elif "trapped" in low or "rescue" in low:
            return IncidentLabel.SEARCH_AND_RESCUE
        return IncidentLabel.INFRASTRUCTURE_FAILURE
