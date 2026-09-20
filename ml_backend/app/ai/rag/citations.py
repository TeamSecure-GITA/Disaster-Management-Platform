"""
Citation management for RAG-generated answers.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Citation:
    """Citation pointing to retrieved evidence."""

    citation_id: str
    document_id: str
    title: str
    source: str
    chunk_id: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    relevance_score: Optional[float] = None
    excerpt: Optional[str] = None
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "citation_id": self.citation_id,
            "document_id": self.document_id,
            "title": self.title,
            "source": self.source,
            "chunk_id": self.chunk_id,
            "page": self.page,
            "section": self.section,
            "relevance_score": self.relevance_score,
            "excerpt": self.excerpt,
            "metadata": self.metadata,
        }


class CitationManager:
    """Creates and formats citations from RAG results."""

    def create_from_result(
        self,
        result: Any,
        citation_number: int,
    ) -> Citation:
        """
        Create a citation from either a RetrievalResult or RerankResult.
        """

        if hasattr(result, "result"):
            base = result.result
            relevance_score = getattr(
                result,
                "score",
                None,
            )
        else:
            base = result
            relevance_score = getattr(
                result,
                "score",
                None,
            )

        chunk = base.chunk

        metadata = chunk.metadata or {}

        return Citation(
            citation_id=f"[{citation_number}]",
            document_id=chunk.document_id,
            title=metadata.get(
                "title",
                chunk.document_id,
            ),
            source=metadata.get(
                "source",
                "unknown",
            ),
            chunk_id=chunk.id,
            page=metadata.get("page"),
            section=metadata.get("section"),
            relevance_score=relevance_score,
            excerpt=chunk.text[:500],
            metadata=metadata,
        )

    def create_many(
        self,
        results: List[Any],
    ) -> List[Citation]:
        """Create numbered citations."""

        citations = []

        for index, result in enumerate(
            results,
            start=1,
        ):
            citations.append(
                self.create_from_result(
                    result,
                    index,
                )
            )

        return citations

    def format_inline(
        self,
        citation: Citation,
    ) -> str:
        """Create a compact inline citation."""

        return citation.citation_id

    def format_source(
        self,
        citation: Citation,
    ) -> str:
        """Create a readable source entry."""

        parts = [
            citation.citation_id,
            citation.title,
        ]

        if citation.section:
            parts.append(
                f"Section: {citation.section}"
            )

        if citation.page is not None:
            parts.append(
                f"Page: {citation.page}"
            )

        parts.append(
            f"Source: {citation.source}"
        )

        return " — ".join(parts)

    def format_bibliography(
        self,
        citations: List[Citation],
    ) -> str:
        """Create a bibliography block."""

        if not citations:
            return ""

        return "\n".join(
            self.format_source(citation)
            for citation in citations
        )

    @staticmethod
    def deduplicate(
        citations: List[Citation],
    ) -> List[Citation]:
        """Remove duplicate document/chunk citations."""

        seen = set()
        output = []

        for citation in citations:
            key = (
                citation.document_id,
                citation.chunk_id,
            )

            if key in seen:
                continue

            seen.add(key)
            output.append(citation)

        return output