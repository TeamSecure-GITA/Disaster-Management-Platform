"""NLP metrics: Rouge, BLEU, and F1."""
from __future__ import annotations

class NLPEvaluator:
    def compute_rouge1(self, reference: str, candidate: str) -> float:
        ref_tokens = set(reference.lower().split())
        cand_tokens = set(candidate.lower().split())
        if not ref_tokens:
            return 1.0
        return len(ref_tokens.intersection(cand_tokens)) / len(ref_tokens)
