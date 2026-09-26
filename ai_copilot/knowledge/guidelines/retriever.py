from typing import List, Dict, Any
from .loader import GuidelinesLoader

class GuidelinesRetriever:
    def __init__(self):
        self.loader = GuidelinesLoader()
        self.guidelines = self.loader.load_guidelines()

    def find_guideline(self, keyword: str) -> List[Dict[str, Any]]:
        return [g for g in self.guidelines if keyword.lower() in g["name"].lower()]
