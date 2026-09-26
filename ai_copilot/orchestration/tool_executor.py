from typing import Dict, Any, List
from tools.registry import ToolRegistry
from schemas.tool import ToolExecutionResult

class ToolExecutor:
    def __init__(self, registry: ToolRegistry = None):
        self.registry = registry or ToolRegistry()

    def execute_tool(self, tool_name: str, args: Dict[str, Any]) -> ToolExecutionResult:
        tool = self.registry.get_tool(tool_name)
        if not tool:
            return ToolExecutionResult(
                tool_name=tool_name,
                success=False,
                error=f"Tool '{tool_name}' not found in registry."
            )
        return tool.execute(**args)

    def execute_batch(self, tool_calls: List[Dict[str, Any]]) -> List[ToolExecutionResult]:
        results = []
        for call in tool_calls:
            t_name = call.get("tool_name")
            t_args = call.get("arguments", {})
            results.append(self.execute_tool(t_name, t_args))
        return results
