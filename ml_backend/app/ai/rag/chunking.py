"""
Document chunking for RAG.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class DocumentChunk:
    """A retrievable section of a document."""

    id: str
    document_id: str
    text: str
    chunk_index: int
    start_offset: int
    end_offset: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "document_id": self.document_id,
            "text": self.text,
            "chunk_index": self.chunk_index,
            "start_offset": self.start_offset,
            "end_offset": self.end_offset,
            "metadata": self.metadata,
        }


class TextChunker:
    """
    Splits documents into overlapping chunks.

    Character-based chunking is used here because it has no external
    tokenizer dependency.
    """

    def __init__(
        self,
        chunk_size: int = 1200,
        overlap: int = 200,
    ):
        if chunk_size <= 0:
            raise ValueError(
                "chunk_size must be greater than zero."
            )

        if overlap < 0 or overlap >= chunk_size:
            raise ValueError(
                "overlap must be >= 0 and smaller than chunk_size."
            )

        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk(
        self,
        document_id: str,
        text: Optional[str] = None,
        metadata: Dict[str, Any] | None = None,
    ) -> List[DocumentChunk]:
        """Create overlapping chunks."""
        if text is None:
            text = document_id
            document_id = "doc_1"

        if not text or not text.strip():
            return []

        normalized = self._normalize(text)

        chunks: List[DocumentChunk] = []

        start = 0
        index = 0

        step = self.chunk_size - self.overlap

        while start < len(normalized):
            end = min(
                start + self.chunk_size,
                len(normalized),
            )

            chunk_text = normalized[
                start:end
            ].strip()

            if chunk_text:
                chunks.append(
                    DocumentChunk(
                        id=f"{document_id}:{index}",
                        document_id=document_id,
                        text=chunk_text,
                        chunk_index=index,
                        start_offset=start,
                        end_offset=end,
                        metadata=metadata or {},
                    )
                )

            if end >= len(normalized):
                break

            start += step
            index += 1

        return chunks

    def chunk_sentences(
        self,
        document_id: str,
        text: str,
        metadata: Dict[str, Any] | None = None,
    ) -> List[DocumentChunk]:
        """
        Sentence-aware chunking.

        This attempts to keep sentence boundaries intact while respecting
        approximately the configured chunk size.
        """

        sentences = re.split(
            r"(?<=[.!?])\s+",
            self._normalize(text),
        )

        chunks: List[DocumentChunk] = []
        buffer = ""
        index = 0
        offset = 0

        for sentence in sentences:
            sentence = sentence.strip()

            if not sentence:
                continue

            candidate = (
                f"{buffer} {sentence}".strip()
            )

            if (
                buffer
                and len(candidate) > self.chunk_size
            ):
                start = offset
                end = start + len(buffer)

                chunks.append(
                    DocumentChunk(
                        id=f"{document_id}:{index}",
                        document_id=document_id,
                        text=buffer,
                        chunk_index=index,
                        start_offset=start,
                        end_offset=end,
                        metadata=metadata or {},
                    )
                )

                index += 1

                overlap_text = buffer[
                    -self.overlap:
                ]

                buffer = (
                    f"{overlap_text} {sentence}"
                ).strip()

                offset = max(
                    0,
                    end - len(overlap_text),
                )

            else:
                buffer = candidate

        if buffer:
            chunks.append(
                DocumentChunk(
                    id=f"{document_id}:{index}",
                    document_id=document_id,
                    text=buffer,
                    chunk_index=index,
                    start_offset=offset,
                    end_offset=offset + len(buffer),
                    metadata=metadata or {},
                )
            )

        return chunks

    @staticmethod
    def _normalize(text: str) -> str:
        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()