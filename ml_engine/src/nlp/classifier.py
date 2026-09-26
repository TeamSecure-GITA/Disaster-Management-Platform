"""Text classification interface."""
from __future__ import annotations
import numpy as np
from .embeddings import TextEmbedder

class EmergencyTextClassifier:
    def __init__(self) -> None:
        self.embedder = TextEmbedder()

    def classify_urgency(self, text: str) -> dict:
        emb = self.embedder.embed(text)
        prob = float(np.clip(np.mean(emb) * 5.0 + 0.5, 0.0, 1.0))
        return {"urgent": prob > 0.5, "urgency_score": prob}
