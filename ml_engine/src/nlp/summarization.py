"""Extractive text summarization."""
from __future__ import annotations

class TextSummarizer:
    def summarize(self, text: str, max_sentences: int = 2) -> str:
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        return '. '.join(sentences[:max_sentences]) + ('.' if sentences else '')
