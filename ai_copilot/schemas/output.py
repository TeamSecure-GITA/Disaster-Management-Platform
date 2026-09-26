from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class MapLayer(BaseModel):
    layer_type: str = "geojson"
    title: str
    data: Dict[str, Any]
    style: Dict[str, Any] = Field(default_factory=dict)

class ChartData(BaseModel):
    chart_type: str = "line"  # bar, line, pie, gauge
    title: str
    labels: List[str]
    series: List[Dict[str, Any]]

class ActionItem(BaseModel):
    action_id: str
    title: str
    description: str
    urgency: str = "immediate"  # immediate, high, medium, low
    assignee_type: Optional[str] = None
    requires_confirmation: bool = False
    status: str = "pending"

class CopilotResponse(BaseModel):
    response_id: str
    answer: str
    intent: Optional[str] = None
    confidence: float = 1.0
    actions: List[ActionItem] = Field(default_factory=list)
    maps: List[MapLayer] = Field(default_factory=list)
    charts: List[ChartData] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    requires_human_confirmation: bool = False
    confirmation_prompt: Optional[str] = None
    latency_ms: float = 0.0
