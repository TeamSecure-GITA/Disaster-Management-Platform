from typing import Tuple

class DocumentValidator:
    def __init__(self, max_size_mb: int = 50):
        self.max_size = max_size_mb * 1024 * 1024

    def validate(self, doc_bytes: bytes, mime_type: str) -> Tuple[bool, str]:
        if not doc_bytes:
            return False, "Document cannot be empty."
        if len(doc_bytes) > self.max_size:
            return False, "Document file size exceeds threshold."
        allowed = ["application/pdf", "text/plain", "application/json", "text/markdown", "text/csv"]
        if mime_type.lower() not in allowed:
            return False, f"Unsupported document format: {mime_type}"
        return True, "Valid document."
