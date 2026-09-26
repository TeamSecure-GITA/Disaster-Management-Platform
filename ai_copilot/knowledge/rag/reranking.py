from typing import List, Dict, Any

class DocumentReranker:
    def rerank(self, query: str, candidate_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        q_tokens = set(query.lower().split())
        for doc in candidate_docs:
            doc_text = doc.get("text", "").lower()
            overlap = sum(1 for token in q_tokens if token in doc_text)
            doc["rerank_score"] = overlap
        candidate_docs.sort(key=lambda d: d.get("rerank_score", 0), reverse=True)
        return candidate_docs
