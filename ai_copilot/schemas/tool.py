from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = True
    default: Optional[Any] = None

class ToolDefinition(BaseModel):
    name: str
    description: str
    category: str
    parameters: List[ToolParameter] = Field(default_factory=list)
    requires_confirmation: bool = False

class ToolExecutionRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    execution_id: Optional[str] = None
    user_id: Optional[str] = None

class ToolExecutionResult(BaseModel):
    tool_name: str
    success: bool
    data: Any = None
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    requires_human_confirmation: bool = False
    confirmation_token: Optional[str] = None
