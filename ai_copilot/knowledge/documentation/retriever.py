from typing import List, Dict, Any
from .loader import DocLoader

class DocRetriever:
    def __init__(self):
        self.docs = DocLoader().load_all_docs()

    def retrieve(self, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        return [d for d in self.docs if q in d["title"].lower() or q in d["content"].lower()]
