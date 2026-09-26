from __future__ import annotations
from .model import SummarizationModel

class EmergencySummarizer:
    def __init__(self) -> None:
        self.model = SummarizationModel()
    def summarize(self, text: str) -> str:
        return self.model.generate_summary(text)
