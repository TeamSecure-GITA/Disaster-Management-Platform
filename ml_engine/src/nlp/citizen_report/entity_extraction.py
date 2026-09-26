from __future__ import annotations
import re

class ReportEntityExtractor:
    def extract_casualties(self, text: str) -> int:
        match = re.search(r'(\d+)\s*(people|persons|injured|trapped)', text, re.IGNORECASE)
        return int(match.group(1)) if match else 0
