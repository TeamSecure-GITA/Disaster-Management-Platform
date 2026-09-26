from typing import Dict, Any

class ConfidenceEvaluator:
    def evaluate(self, matched_keywords_count: int, semantic_similarity: float) -> float:
        # Dynamic confidence blending keyword signal and model score
        raw = (matched_keywords_count * 0.2) + (semantic_similarity * 0.8)
        return min(max(round(raw, 3), 0.0), 1.0)
