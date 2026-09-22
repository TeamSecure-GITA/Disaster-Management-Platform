import pytest
from app.ai.rag.chunking import TextChunker
from app.ai.rag.retrieval import InMemoryRetriever

def test_chunk_document():
    text = "Emergency operating procedure for rapid flood evacuation. Step 1: Notify Sector A."
    chunker = TextChunker()
    chunks = chunker.chunk(text)
    assert len(chunks) >= 1

def test_knowledge_retriever():
    retriever = InMemoryRetriever()
    results = retriever.search("evacuation protocol", limit=3)
    assert isinstance(results, list)
