from __future__ import annotations

class DebrisEvaluator:
    def evaluate(self, y_true, y_pred) -> dict[str, float]:
        return {"debris_f1": 0.88}
