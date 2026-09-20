"""
Embedding abstraction.

The default provider is deterministic and dependency-free. It is useful for
development/testing, but it is NOT a semantic embedding model.

A production deployment can replace it with:
- OpenAI embeddings
- sentence-transformers
- another vector embedding service
"""

from __future__ import annotations

import hashlib
import math
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class EmbeddingResult:
    """Embedding output."""

    vector: List[float]
    model: str
    dimensions: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model": self.model,
            "dimensions": self.dimensions,
            "vector": self.vector,
        }


class EmbeddingProvider(ABC):
    """Provider interface."""

    @abstractmethod
    def embed(self, text: str) -> EmbeddingResult:
        raise NotImplementedError

    def embed_many(
        self,
        texts: List[str],
    ) -> List[EmbeddingResult]:
        return [
            self.embed(text)
            for text in texts
        ]


class HashEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic hash-based vectorizer.

    This is a development fallback, not a semantic embedding model.
    """

    def __init__(
        self,
        dimensions: int = 256,
    ):
        if dimensions <= 0:
            raise ValueError(
                "dimensions must be greater than zero."
            )

        self.dimensions = dimensions
        self.model_name = "hash-embedding-v1"

    def embed(
        self,
        text: str,
    ) -> EmbeddingResult:

        vector = [0.0] * self.dimensions

        tokens = re.findall(
            r"\b\w+\b",
            text.lower(),
        )

        for token in tokens:
            digest = hashlib.sha256(
                token.encode("utf-8")
            ).digest()

            index = int.from_bytes(
                digest[:4],
                "big",
            ) % self.dimensions

            sign = (
                1.0
                if digest[4] % 2 == 0
                else -1.0
            )

            vector[index] += sign

        norm = math.sqrt(
            sum(value * value for value in vector)
        )

        if norm > 0:
            vector = [
                value / norm
                for value in vector
            ]

        return EmbeddingResult(
            vector=vector,
            model=self.model_name,
            dimensions=self.dimensions,
        )


def cosine_similarity(
    a: List[float],
    b: List[float],
) -> float:
    """Calculate cosine similarity."""

    if len(a) != len(b):
        raise ValueError(
            "Vectors must have equal dimensions."
        )

    numerator = sum(
        x * y
        for x, y in zip(a, b)
    )

    norm_a = math.sqrt(
        sum(x * x for x in a)
    )

    norm_b = math.sqrt(
        sum(y * y for y in b)
    )

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return numerator / (
        norm_a * norm_b
    )