"""Information and entity extraction from reports."""
from __future__ import annotations
import re

class EmergencyEntityExtractor:
    def extract_keywords(self, text: str) -> list[str]:
        keywords = ["trapped", "injured", "flood", "fire", "collapse", "rescue", "shelter"]
        found = [kw for kw in keywords if re.search(r'' + kw + r'', text, re.IGNORECASE)]
        return found
