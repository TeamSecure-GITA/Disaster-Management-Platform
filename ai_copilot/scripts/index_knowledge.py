from knowledge.sop.loader import SOPLoader
from knowledge.rag.ingestion import KnowledgeIngestionPipeline

def main():
    print("[INDEX] Loading SOPs and Guidelines...")
    sops = SOPLoader().load()
    pipeline = KnowledgeIngestionPipeline()
    total_chunks = 0
    for sop in sops:
        chunks = pipeline.process_document(sop["procedures"], source_id=sop["id"])
        total_chunks += len(chunks)
    print(f"[INDEX] Successfully indexed {len(sops)} SOP documents into {total_chunks} vector chunks.")

if __name__ == "__main__":
    main()
