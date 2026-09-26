from __future__ import annotations
import re

class LocationExtractor:
    def extract_locations(self, text: str) -> list[str]:
        # Regex heuristics for streets, bridges, districts
        matches = re.findall(r'(near [A-Z][a-z]+|at [A-Z][a-z]+|[A-Z][a-z]+ Bridge|[A-Z][a-z]+ District)', text)
        return matches or ["City Center"]
