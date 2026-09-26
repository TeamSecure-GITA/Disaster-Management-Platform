from typing import List, Dict, Any
from schemas.tool import ToolExecutionResult

class ConflictDetector:
    def detect_conflicts(self, results: List[ToolExecutionResult]) -> List[str]:
        conflicts = []
        # Check if weather reports sunny while river sensor indicates overflow
        for r in results:
            if r.tool_name == "ml_prediction" and r.success:
                pred = r.data or {}
                if pred.get("risk_level") == "critical" and pred.get("probability", 0) < 0.5:
                    conflicts.append("Model critical risk discrepancy with low probability score.")
        return conflicts
