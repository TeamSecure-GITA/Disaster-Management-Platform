from typing import Dict, Any, List

class PDFParser:
    def parse_pdf(self, pdf_bytes: bytes) -> Dict[str, Any]:
        text_content = pdf_bytes.decode("latin-1", errors="ignore")
        return {
            "pages": 1,
            "raw_text": text_content[:5000],
            "title": "Disaster Situation Report / Standard Operating Procedure",
            "metadata": {"source": "SOP_Archive"}
        }
