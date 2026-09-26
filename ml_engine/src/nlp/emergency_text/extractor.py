from __future__ import annotations
from .location_extraction import LocationExtractor
from .entity_extraction import EmergencyEntityExtractor

class EmergencyTextExtractor:
    def __init__(self) -> None:
        self.loc_extractor = LocationExtractor()
        self.entity_extractor = EmergencyEntityExtractor()
    def extract_all(self, text: str) -> dict:
        return {
            "locations": self.loc_extractor.extract_locations(text),
            "entities": self.entity_extractor.extract_entities(text)
        }
