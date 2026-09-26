"""Text cleaning, normalization, and stopword removal."""
from __future__ import annotations
import re

class TextPreprocessor:
    def clean(self, text: str) -> str:
        t = re.sub(r'https?://\S+|www\.\S+', '', text)
        t = re.sub(r'[^\w\s]', ' ', t)
        return ' '.join(t.lower().split())
