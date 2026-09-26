from typing import List, Dict, Any
import numpy as np
from .embeddings import MockEmbeddingEngine

class VectorRetriever:
    def __init__(self):
        self.embedder = MockEmbeddingEngine()
        self.index: List[Dict[str, Any]] = []

    def add_documents(self, documents: List[Dict[str, Any]]):
        self.index.extend(documents)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.index:
            return []
        q_vec = np.array(self.embedder.embed_text(query))
        scored = []
        for doc in self.index:
            d_vec = np.array(doc.get("embedding", [0] * len(q_vec)))
            similarity = float(np.dot(q_vec, d_vec))
            scored.append((similarity, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]
