from typing import List
import numpy as np

class MockEmbeddingEngine:
    def __init__(self, dim: int = 128):
        self.dim = dim

    def embed_text(self, text: str) -> List[float]:
        # Deterministic hash-based pseudo embedding for test & offline execution
        h = sum(ord(c) for c in text)
        np.random.seed(h % 100000)
        vec = np.random.randn(self.dim)
        norm = np.linalg.norm(vec)
        return (vec / norm).tolist()
