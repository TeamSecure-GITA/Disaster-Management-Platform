from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    WAITING_CONFIRMATION = "waiting_confirmation"

class ExecutionStep(BaseModel):
    step_id: str
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    status: StepStatus = StepStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None

class WorkflowState(BaseModel):
    workflow_id: str
    intent: str
    steps: List[ExecutionStep] = Field(default_factory=list)
    current_step_index: int = 0
    is_completed: bool = False
    requires_confirmation: bool = False
    confirmation_payload: Optional[Dict[str, Any]] = None
