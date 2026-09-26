from typing import List, Dict, Any

class CitationGenerator:
    def format_citations(self, used_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        for c in used_chunks:
            citations.append({
                "source_id": c.get("source_id", "Unknown"),
                "chunk_id": c.get("chunk_id", ""),
                "snippet": c.get("text", "")[:120] + "..."
            })
        return citations
