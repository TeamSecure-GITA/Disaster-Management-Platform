"""
RAG retrieval layer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from .chunking import DocumentChunk
from .embeddings import (
    EmbeddingProvider,
    HashEmbeddingProvider,
    cosine_similarity,
)


@dataclass
class RetrievalResult:
    """Retrieved document chunk."""

    chunk: DocumentChunk
    score: float
    retrieval_method: str
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk": self.chunk.to_dict(),
            "score": self.score,
            "retrieval_method": self.retrieval_method,
            "metadata": self.metadata,
        }


class InMemoryRetriever:
    """
    Lightweight vector retriever.

    Suitable for development and demonstrations.

    For production, this can be replaced by:
    - pgvector
    - Qdrant
    - Weaviate
    - Elasticsearch/OpenSearch
    - another vector database
    """

    def __init__(
        self,
        embedding_provider: Optional[
            EmbeddingProvider
        ] = None,
    ):
        self.embedding_provider = (
            embedding_provider
            or HashEmbeddingProvider()
        )

        self._chunks: Dict[
            str,
            DocumentChunk
        ] = {}

        self._vectors: Dict[
            str,
            List[float]
        ] = {}

    def add(
        self,
        chunks: List[DocumentChunk],
    ) -> int:
        """Index document chunks."""

        count = 0

        for chunk in chunks:
            embedding = self.embedding_provider.embed(
                chunk.text
            )

            self._chunks[chunk.id] = chunk
            self._vectors[chunk.id] = (
                embedding.vector
            )

            count += 1

        return count

    def remove_document(
        self,
        document_id: str,
    ) -> int:
        """Remove all chunks belonging to a document."""

        ids = [
            chunk_id
            for chunk_id, chunk
            in self._chunks.items()
            if chunk.document_id == document_id
        ]

        for chunk_id in ids:
            self._chunks.pop(chunk_id, None)
            self._vectors.pop(chunk_id, None)

        return len(ids)

    def search(
        self,
        query: str,
        *,
        top_k: int = 5,
        min_score: float = 0.0,
    ) -> List[RetrievalResult]:
        """Perform vector similarity search."""

        if not query.strip():
            return []

        query_embedding = self.embedding_provider.embed(
            query
        )

        results: List[RetrievalResult] = []

        for chunk_id, chunk in self._chunks.items():
            vector = self._vectors[chunk_id]

            score = cosine_similarity(
                query_embedding.vector,
                vector,
            )

            if score >= min_score:
                results.append(
                    RetrievalResult(
                        chunk=chunk,
                        score=round(score, 6),
                        retrieval_method="vector",
                    )
                )

        results.sort(
            key=lambda item: item.score,
            reverse=True,
        )

        return results[:max(1, top_k)]

    def keyword_search(
        self,
        query: str,
        *,
        top_k: int = 5,
    ) -> List[RetrievalResult]:
        """Lexical fallback search."""

        terms = {
            term.lower()
            for term in query.split()
            if len(term) >= 3
        }

        results = []

        for chunk in self._chunks.values():
            text = chunk.text.lower()

            matches = sum(
                text.count(term)
                for term in terms
            )

            if matches > 0:
                score = matches / max(
                    len(terms),
                    1,
                )

                results.append(
                    RetrievalResult(
                        chunk=chunk,
                        score=round(
                            min(score, 1.0),
                            6,
                        ),
                        retrieval_method="keyword",
                    )
                )

        results.sort(
            key=lambda item: item.score,
            reverse=True,
        )

        return results[:max(1, top_k)]

    def count(self) -> int:
        return len(self._chunks)

    def health(self) -> Dict[str, Any]:
        return {
            "service": "rag_retriever",
            "status": "healthy",
            "chunks": len(self._chunks),
            "embedding_model": (
                self.embedding_provider.__class__.__name__
            ),
        }