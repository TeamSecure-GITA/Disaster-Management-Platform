from __future__ import annotations
from src.nlp.emergency_text import EmergencyTextExtractor

def test_emergency_text():
    extractor = EmergencyTextExtractor()
    res = extractor.extract_all("We need assistance near Greenfield Bridge, urgent")
    assert "locations" in res
    assert len(res["locations"]) > 0
