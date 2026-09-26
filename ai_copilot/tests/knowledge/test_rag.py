from knowledge.rag.chunking import DocumentChunker
from knowledge.rag.retrieval import VectorRetriever
from knowledge.rag.ingestion import KnowledgeIngestionPipeline

def test_rag_pipeline():
    pipeline = KnowledgeIngestionPipeline()
    retriever = VectorRetriever()
    doc = "Standard Operating Procedure for Dam Flood Control. Sound Level-3 sirens immediately."
    chunks = pipeline.process_document(doc, "SOP_DAM")
    assert len(chunks) > 0
    retriever.add_documents(chunks)
    res = retriever.retrieve("Dam Flood", top_k=1)
    assert len(res) == 1
