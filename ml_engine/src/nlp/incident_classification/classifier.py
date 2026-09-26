from __future__ import annotations
from .model import IncidentClassificationModel

class IncidentClassifier:
    def __init__(self) -> None:
        self.model = IncidentClassificationModel()
    def classify(self, text: str) -> dict:
        label = self.model.predict_category(text)
        return {"label": label.value, "confidence": 0.89}
