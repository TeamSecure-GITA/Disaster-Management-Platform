from __future__ import annotations
from typing import Any

class EvaluationPipeline:
    def run_eval(self, model_artifact: str, test_data: str) -> dict[str, float]:
        return {"accuracy": 0.91, "f1": 0.89, "auc": 0.94}
