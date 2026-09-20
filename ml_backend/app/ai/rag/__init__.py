"""
Retrieval-Augmented Generation (RAG) subsystem.

The RAG pipeline is:

Document
    ↓
Ingestion
    ↓
Chunking
    ↓
Embeddings
    ↓
Retrieval
    ↓
Reranking
    ↓
Citations
    ↓
AI response
"""

from .ingestion import (
    Document,
    DocumentIngestion,
)

from .chunking import (
    DocumentChunk,
    TextChunker,
)

from .embeddings import (
    EmbeddingResult,
    EmbeddingProvider,
    HashEmbeddingProvider,
)

from .retrieval import (
    RetrievalResult,
    InMemoryRetriever,
)

from .reranking import (
    RerankResult,
    Reranker,
)

from .citations import (
    Citation,
    CitationManager,
)


__all__ = [
    "Document",
    "DocumentIngestion",
    "DocumentChunk",
    "TextChunker",
    "EmbeddingResult",
    "EmbeddingProvider",
    "HashEmbeddingProvider",
    "RetrievalResult",
    "InMemoryRetriever",
    "RerankResult",
    "Reranker",
    "Citation",
    "CitationManager",
]