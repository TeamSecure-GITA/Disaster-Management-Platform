from typing import List, Dict, Any
from .retriever import DocRetriever

class DocSearch:
    def __init__(self):
        self.retriever = DocRetriever()

    def search(self, query: str) -> List[Dict[str, Any]]:
        return self.retriever.retrieve(query)
