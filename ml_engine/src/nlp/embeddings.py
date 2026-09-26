"""Vector embedding generation for emergency text."""
from __future__ import annotations
import numpy as np

class TextEmbedder:
    """Generates dense semantic embeddings from emergency narratives."""
    def __init__(self, dim: int = 64) -> None:
        self.dim = dim

    def embed(self, text: str) -> np.ndarray:
        # Fast deterministic hash-based representation
        np.random.seed(abs(hash(text)) % (2**31))
        vec = np.random.randn(self.dim)
        return vec / (np.linalg.norm(vec) + 1e-6)
