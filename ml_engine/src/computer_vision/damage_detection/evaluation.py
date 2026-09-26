"""Damage detection evaluation."""
from __future__ import annotations

class DamageEvaluator:
    def evaluate(self, y_true: list[str], y_pred: list[str]) -> dict[str, float]:
        matches = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
        acc = matches / (len(y_true) or 1)
        return {"accuracy": acc}
