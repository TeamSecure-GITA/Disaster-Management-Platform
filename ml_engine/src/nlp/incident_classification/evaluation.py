from __future__ import annotations

class IncidentClassificationEvaluator:
    def evaluate(self, y_true, y_pred) -> dict[str, float]:
        matches = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
        return {"accuracy": matches / (len(y_true) or 1)}
