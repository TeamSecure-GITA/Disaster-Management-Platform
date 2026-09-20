"""
Document analysis abstraction.

Handles extracted document content and delegates specialized parsing/analysis
to providers when connected.
"""

from __future__ import annotations

import hashlib
import mimetypes
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class DocumentAnalysisResult:
    """Structured document-analysis result."""

    success: bool
    status: str
    document_id: str
    title: Optional[str] = None
    summary: Optional[str] = None
    text: Optional[str] = None
    sections: List[Dict[str, Any]] = field(
        default_factory=list
    )
    entities: List[Dict[str, Any]] = field(
        default_factory=list
    )
    tables: List[Dict[str, Any]] = field(
        default_factory=list
    )
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )
    warnings: List[str] = field(
        default_factory=list
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "document_id": self.document_id,
            "title": self.title,
            "summary": self.summary,
            "text": self.text,
            "sections": self.sections,
            "entities": self.entities,
            "tables": self.tables,
            "metadata": self.metadata,
            "warnings": self.warnings,
        }


class DocumentAnalyzer:
    """
    Provider-agnostic document analyzer.

    Text-readable documents can be loaded directly. Complex PDF/DOCX
    extraction can be supplied by a provider.
    """

    TEXT_TYPES = {
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
    }

    DOCUMENT_TYPES = {
        "application/pdf",
        "application/msword",
        (
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
    }

    def __init__(
        self,
        provider: Optional[Any] = None,
    ):
        self.provider = provider

    def analyze(
        self,
        document_path: str,
        *,
        extract_text: bool = True,
        summarize: bool = True,
        extract_entities: bool = True,
        extract_tables: bool = True,
    ) -> DocumentAnalysisResult:
        """Analyze a document."""

        path = Path(document_path)

        if not path.exists():
            return DocumentAnalysisResult(
                success=False,
                status="not_found",
                document_id="",
                warnings=[
                    "Document file was not found."
                ],
            )

        mime_type, _ = mimetypes.guess_type(
            str(path)
        )

        document_id = self._file_id(path)

        # ---------------------------------------------------------
        # Provider path
        # ---------------------------------------------------------

        if self.provider is not None:
            try:
                result = self.provider.analyze_document(
                    document_path=str(path),
                    extract_text=extract_text,
                    summarize=summarize,
                    extract_entities=extract_entities,
                    extract_tables=extract_tables,
                )

                return self._normalize(
                    document_id,
                    result,
                )

            except Exception as exc:
                return DocumentAnalysisResult(
                    success=False,
                    status="provider_error",
                    document_id=document_id,
                    warnings=[
                        f"Document provider failed: {exc}"
                    ],
                )

        # ---------------------------------------------------------
        # Built-in text extraction
        # ---------------------------------------------------------

        if mime_type in self.TEXT_TYPES:
            try:
                text = path.read_text(
                    encoding="utf-8"
                )

                return DocumentAnalysisResult(
                    success=True,
                    status="text_extracted",
                    document_id=document_id,
                    title=path.stem,
                    text=text if extract_text else None,
                    metadata={
                        "filename": path.name,
                        "mime_type": mime_type,
                        "size_bytes": path.stat().st_size,
                    },
                    warnings=[
                        "No document AI provider is connected.",
                        "Advanced summarization and entity extraction "
                        "were not performed.",
                    ],
                )

            except UnicodeDecodeError:
                return DocumentAnalysisResult(
                    success=False,
                    status="decode_error",
                    document_id=document_id,
                    warnings=[
                        "Document could not be decoded as UTF-8."
                    ],
                )

        # ---------------------------------------------------------
        # Unsupported provider-less format
        # ---------------------------------------------------------

        return DocumentAnalysisResult(
            success=True,
            status="provider_not_connected",
            document_id=document_id,
            title=path.stem,
            warnings=[
                "No document-analysis provider is connected.",
                (
                    "The file format requires a specialized "
                    "document parser."
                ),
            ],
            metadata={
                "filename": path.name,
                "mime_type": mime_type,
                "size_bytes": path.stat().st_size,
            },
        )

    def analyze_text(
        self,
        text: str,
        *,
        title: Optional[str] = None,
    ) -> DocumentAnalysisResult:
        """Analyze already-extracted text."""

        if not text or not text.strip():
            return DocumentAnalysisResult(
                success=False,
                status="empty_document",
                document_id="",
            )

        document_id = hashlib.sha256(
            text.encode("utf-8")
        ).hexdigest()[:32]

        return DocumentAnalysisResult(
            success=True,
            status="text_available",
            document_id=document_id,
            title=title,
            text=text,
            metadata={
                "source": "provided_text"
            },
        )

    def _normalize(
        self,
        document_id: str,
        result: Any,
    ) -> DocumentAnalysisResult:

        if isinstance(result, DocumentAnalysisResult):
            result.document_id = document_id
            return result

        if not isinstance(result, dict):
            return DocumentAnalysisResult(
                success=False,
                status="invalid_provider_response",
                document_id=document_id,
            )

        return DocumentAnalysisResult(
            success=bool(result.get("success", True)),
            status=result.get("status", "completed"),
            document_id=document_id,
            title=result.get("title"),
            summary=result.get("summary"),
            text=result.get("text"),
            sections=result.get("sections", []),
            entities=result.get("entities", []),
            tables=result.get("tables", []),
            metadata=result.get("metadata", {}),
            warnings=result.get("warnings", []),
        )

    @staticmethod
    def _file_id(path: Path) -> str:
        digest = hashlib.sha256()

        with path.open("rb") as file:
            for block in iter(
                lambda: file.read(1024 * 1024),
                b"",
            ):
                digest.update(block)

        return digest.hexdigest()[:32]

    def health(self) -> Dict[str, Any]:
        return {
            "service": "document_analyzer",
            "status": (
                "connected"
                if self.provider is not None
                else "provider_not_connected"
            ),
        }