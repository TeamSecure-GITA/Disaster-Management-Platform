from typing import List, Dict, Any

class DocumentChunker:
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str, source_id: str) -> List[Dict[str, Any]]:
        words = text.split()
        chunks = []
        start = 0
        idx = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_str = " ".join(words[start:end])
            chunks.append({
                "chunk_id": f"{source_id}_chunk_{idx}",
                "source_id": source_id,
                "text": chunk_str,
                "token_count": len(words[start:end])
            })
            idx += 1
            start += (self.chunk_size - self.overlap)
        return chunks
