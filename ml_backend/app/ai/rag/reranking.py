"""
Reranking layer for retrieved RAG results.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Dict, List

from .retrieval import RetrievalResult


@dataclass
class RerankResult:
    """Reranked retrieval result."""

    result: RetrievalResult
    score: float
    rank: int

    def to_dict(self) -> Dict[str, Any]:
        data = self.result.to_dict()

        data.update(
            {
                "rerank_score": self.score,
                "rank": self.rank,
            }
        )

        return data


class Reranker:
    """
    Lightweight lexical reranker.

    Combines:
    - original retrieval score
    - query-term overlap
    - exact phrase matching
    """

    def __init__(
        self,
        retrieval_weight: float = 0.65,
        lexical_weight: float = 0.35,
    ):
        total = (
            retrieval_weight
            + lexical_weight
        )

        if total <= 0:
            raise ValueError(
                "Reranker weights must have a positive sum."
            )

        self.retrieval_weight = (
            retrieval_weight / total
        )

        self.lexical_weight = (
            lexical_weight / total
        )

    def rerank(
        self,
        query: str,
        results: List[RetrievalResult],
        *,
        top_k: int = 5,
    ) -> List[RerankResult]:
        """Rerank retrieved chunks."""

        query_terms = {
            token.lower()
            for token in re.findall(
                r"\b\w+\b",
                query,
            )
            if len(token) >= 3
        }

        query_lower = query.lower()

        ranked = []

        for result in results:
            text = result.chunk.text.lower()

            if query_terms:
                text_terms = set(
                    re.findall(
                        r"\b\w+\b",
                        text,
                    )
                )

                overlap = len(
                    query_terms & text_terms
                ) / len(query_terms)
            else:
                overlap = 0.0

            phrase_bonus = (
                1.0
                if query_lower in text
                else 0.0
            )

            lexical_score = min(
                1.0,
                overlap * 0.8
                + phrase_bonus * 0.2,
            )

            score = (
                result.score
                * self.retrieval_weight
                + lexical_score
                * self.lexical_weight
            )

            ranked.append(
                (
                    score,
                    result,
                )
            )

        ranked.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        output = []

        for rank, (score, result) in enumerate(
            ranked[:max(1, top_k)],
            start=1,
        ):
            output.append(
                RerankResult(
                    result=result,
                    score=round(score, 6),
                    rank=rank,
                )
            )

        return output