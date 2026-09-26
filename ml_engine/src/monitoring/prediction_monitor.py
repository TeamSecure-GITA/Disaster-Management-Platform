from __future__ import annotations

class PredictionMonitor:
    def __init__(self) -> None:
        self.logged_predictions = []
    def log(self, pred: dict) -> None:
        self.logged_predictions.append(pred)
