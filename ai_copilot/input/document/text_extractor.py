from typing import Dict, Any

class TextExtractor:
    def extract_from_raw(self, doc_bytes: bytes) -> str:
        try:
            return doc_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return ""
