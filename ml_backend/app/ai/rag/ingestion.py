"""
Document ingestion for the RAG pipeline.

This module deliberately keeps storage provider-agnostic.
A database, object store, S3-compatible service, etc. can be connected later.
"""

from __future__ import annotations

import hashlib
import mimetypes
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


@dataclass
class Document:
    """Normalized document representation."""

    id: str
    title: str
    content: str
    source: str
    document_type: str = "text"
    mime_type: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = ""
    checksum: str = ""

    def __post_init__(self) -> None:
        if not self.created_at:
            self.created_at = datetime.now(
                timezone.utc
            ).isoformat()

        if not self.checksum:
            self.checksum = hashlib.sha256(
                self.content.encode("utf-8")
            ).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "source": self.source,
            "document_type": self.document_type,
            "mime_type": self.mime_type,
            "metadata": self.metadata,
            "created_at": self.created_at,
            "checksum": self.checksum,
        }


class DocumentIngestion:
    """
    Document ingestion service.

    Supported directly:
    - plain text
    - Markdown
    - JSON-like text
    - already extracted document content

    PDF/DOCX parsing should be implemented through dedicated providers rather
    than putting heavy parsing dependencies into this core service.
    """

    SUPPORTED_MIME_TYPES = {
        "text/plain",
        "text/markdown",
        "application/json",
        "text/csv",
    }

    def __init__(self) -> None:
        self._documents: Dict[str, Document] = {}

    def ingest_text(
        self,
        *,
        document_id: str,
        title: str,
        content: str,
        source: str,
        document_type: str = "text",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Document:
        """Ingest already extracted text."""

        if not document_id:
            raise ValueError("document_id is required.")

        if not content or not content.strip():
            raise ValueError("Document content cannot be empty.")

        document = Document(
            id=document_id,
            title=title,
            content=content.strip(),
            source=source,
            document_type=document_type,
            metadata=metadata or {},
        )

        self._documents[document.id] = document

        return document

    def ingest_file(
        self,
        path: str,
        *,
        document_id: Optional[str] = None,
        title: Optional[str] = None,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Document:
        """Ingest a text-readable file."""

        file_path = Path(path)

        if not file_path.exists():
            raise FileNotFoundError(str(file_path))

        mime_type, _ = mimetypes.guess_type(
            str(file_path)
        )

        if mime_type not in self.SUPPORTED_MIME_TYPES:
            raise ValueError(
                f"Unsupported MIME type: {mime_type or 'unknown'}"
            )

        content = file_path.read_text(
            encoding="utf-8"
        )

        document_id = (
            document_id
            or hashlib.sha256(
                str(file_path.resolve()).encode()
            ).hexdigest()[:24]
        )

        document = Document(
            id=document_id,
            title=title or file_path.stem,
            content=content,
            source=source or str(file_path),
            document_type=file_path.suffix.lstrip(".") or "text",
            mime_type=mime_type,
            metadata=metadata or {},
        )

        self._documents[document.id] = document

        return document

    def get(
        self,
        document_id: str,
    ) -> Optional[Document]:
        return self._documents.get(document_id)

    def delete(
        self,
        document_id: str,
    ) -> bool:
        return self._documents.pop(
            document_id,
            None,
        ) is not None

    def list_documents(self) -> List[Document]:
        return list(self._documents.values())

    def search(
        self,
        query: str,
    ) -> List[Document]:
        """Simple lexical fallback search."""

        query_terms = {
            term.lower()
            for term in query.split()
            if len(term) >= 3
        }

        if not query_terms:
            return []

        scored = []

        for document in self._documents.values():
            text = document.content.lower()

            score = sum(
                text.count(term)
                for term in query_terms
            )

            if score > 0:
                scored.append(
                    (score, document)
                )

        scored.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return [
            document
            for _, document in scored
        ]

    def health(self) -> Dict[str, Any]:
        return {
            "service": "document_ingestion",
            "status": "healthy",
            "documents": len(self._documents),
        }