"""Tokenization and vocabulary mapping."""
from __future__ import annotations

class TextTokenizer:
    def tokenize(self, text: str) -> list[str]:
        return text.split()
