from input.document.document_parser import DocumentParser
from input.document.document_validator import DocumentValidator

def test_document_pipeline():
    parser = DocumentParser()
    val = DocumentValidator()
    doc_bytes = b"%PDF-1.4 Mock Emergency SOP Content"
    ok, _ = val.validate(doc_bytes, "application/pdf")
    assert ok is True
    parsed = parser.parse(doc_bytes, "sop.pdf", "application/pdf")
    assert "Disaster" in parsed["title"]
