from typing import Dict, Any

class ToolMetricsCollector:
    def __init__(self):
        self.calls: Dict[str, int] = {}

    def record_call(self, tool_name: str):
        self.calls[tool_name] = self.calls.get(tool_name, 0) + 1

    def get_stats(self) -> Dict[str, int]:
        return dict(self.calls)
