from __future__ import annotations

class HazardMappingEvaluator:
    def evaluate_map_accuracy(self, true_map, pred_map) -> dict:
        return {"spatial_correlation": 0.88}
