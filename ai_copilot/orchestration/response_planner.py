from typing import List, Dict, Any
from schemas.tool import ToolExecutionResult

class ResponsePlanner:
    def plan_synthesis(self, intent: str, results: List[ToolExecutionResult]) -> Dict[str, Any]:
        successful_data = {r.tool_name: r.data for r in results if r.success}
        return {
            "intent": intent,
            "evidence_count": len(successful_data),
            "payloads": successful_data,
            "tone": "urgent" if "critical" in str(successful_data).lower() else "informative"
        }
