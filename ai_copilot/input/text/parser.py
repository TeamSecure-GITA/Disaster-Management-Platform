import re
from typing import Dict, Any, List

class TextParser:
    def __init__(self):
        self.coord_pattern = re.compile(r"[-+]?\d{1,2}\.\d+,\s*[-+]?\d{1,3}\.\d+")
        self.emergency_keywords = ["sos", "help", "trapped", "injured", "collapsed", "evacuate", "flood", "landslide"]

    def parse(self, text: str) -> Dict[str, Any]:
        text_clean = text.strip()
        coords_match = self.coord_pattern.findall(text_clean)
        found_emergency = [kw for kw in self.emergency_keywords if re.search(r"\b" + kw + r"\b", text_clean, re.I)]
        return {
            "raw_text": text_clean,
            "word_count": len(text_clean.split()),
            "detected_coordinates": coords_match,
            "emergency_signals": found_emergency,
            "is_emergency_flagged": len(found_emergency) > 0
        }
