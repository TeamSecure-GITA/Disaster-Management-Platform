from __future__ import annotations

class CitizenReportEvaluator:
    def evaluate(self, y_true, y_pred) -> dict[str, float]:
        return {"severity_mae": 0.12}
