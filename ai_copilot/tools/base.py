from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import time
from schemas.tool import ToolExecutionResult

class BaseTool(ABC):
    name: str = "base_tool"
    description: str = "Base disaster management tool"
    category: str = "general"
    requires_confirmation: bool = False

    @abstractmethod
    def run(self, **kwargs) -> Any:
        pass

    def execute(self, **kwargs) -> ToolExecutionResult:
        start_time = time.time()
        try:
            res = self.run(**kwargs)
            duration = (time.time() - start_time) * 1000.0
            return ToolExecutionResult(
                tool_name=self.name,
                success=True,
                data=res,
                execution_time_ms=round(duration, 2),
                requires_human_confirmation=self.requires_confirmation
            )
        except Exception as e:
            duration = (time.time() - start_time) * 1000.0
            return ToolExecutionResult(
                tool_name=self.name,
                success=False,
                error=str(e),
                execution_time_ms=round(duration, 2),
                requires_human_confirmation=self.requires_confirmation
            )
