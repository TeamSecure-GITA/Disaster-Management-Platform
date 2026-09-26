from typing import List, Dict, Any
from .chunking import DocumentChunker
from .embeddings import MockEmbeddingEngine

class KnowledgeIngestionPipeline:
    def __init__(self):
        self.chunker = DocumentChunker()
        self.embedder = MockEmbeddingEngine()

    def process_document(self, doc_text: str, source_id: str) -> List[Dict[str, Any]]:
        chunks = self.chunker.chunk_text(doc_text, source_id)
        for c in chunks:
            c["embedding"] = self.embedder.embed_text(c["text"])
        return chunks
