from typing import List, Dict, Any
from schemas.reasoning import EvidenceItem

class EvidenceAggregator:
    def aggregate(self, tool_results: List[Any], knowledge_docs: List[Dict[str, Any]]) -> List[EvidenceItem]:
        items = []
        for r in tool_results:
            if hasattr(r, "success") and r.success:
                items.append(EvidenceItem(
                    source=f"tool:{r.tool_name}",
                    content=str(r.data),
                    confidence=0.95
                ))
        for d in knowledge_docs:
            items.append(EvidenceItem(
                source=d.get("source_id", "knowledge_base"),
                content=d.get("text", "")[:200],
                confidence=0.90
            ))
        return items
