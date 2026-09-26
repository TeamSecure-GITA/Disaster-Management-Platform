from typing import List, Dict, Any
from .loader import SOPLoader

class SOPRetriever:
    def __init__(self):
        self.loader = SOPLoader()
        self.sops = self.loader.load()

    def search_by_hazard(self, hazard: str) -> List[Dict[str, Any]]:
        return [s for s in self.sops if s.get("hazard", "").lower() == hazard.lower()]
