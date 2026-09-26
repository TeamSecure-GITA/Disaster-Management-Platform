from typing import Dict, Any
from .pdf_parser import PDFParser
from .text_extractor import TextExtractor

class DocumentParser:
    def __init__(self):
        self.pdf_parser = PDFParser()
        self.extractor = TextExtractor()

    def parse(self, doc_bytes: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
        if "pdf" in mime_type.lower() or filename.lower().endswith(".pdf"):
            return self.pdf_parser.parse_pdf(doc_bytes)
        return {
            "filename": filename,
            "raw_text": self.extractor.extract_from_raw(doc_bytes),
            "metadata": {"mime_type": mime_type}
        }
