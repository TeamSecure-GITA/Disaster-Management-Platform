import uuid
from typing import List, Dict, Any
from .execution_state import WorkflowState, ExecutionStep, StepStatus

class WorkflowBuilder:
    def build_workflow(self, intent: str, tool_names: List[str], base_args: Dict[str, Any] = None) -> WorkflowState:
        w_id = str(uuid.uuid4())
        steps = [
            ExecutionStep(step_id=f"{w_id}_{idx}", tool_name=t, arguments=base_args or {})
            for idx, t in enumerate(tool_names)
        ]
        return WorkflowState(workflow_id=w_id, intent=intent, steps=steps)
