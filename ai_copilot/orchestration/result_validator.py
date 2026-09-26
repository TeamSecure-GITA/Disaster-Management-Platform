from typing import List
from schemas.tool import ToolExecutionResult

class ResultValidator:
    def validate_results(self, results: List[ToolExecutionResult]) -> bool:
        if not results:
            return True
        return any(r.success for r in results)
