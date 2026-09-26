from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class EvidenceItem(BaseModel):
    source: str
    content: str
    confidence: float = 1.0
    timestamp: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Hypothesis(BaseModel):
    statement: str
    likelihood: float = Field(..., ge=0.0, le=1.0)
    supporting_evidence: List[EvidenceItem] = Field(default_factory=list)
    refuting_evidence: List[EvidenceItem] = Field(default_factory=list)

class DecisionStep(BaseModel):
    step_number: int
    thought: str
    action: Optional[str] = None
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    observation: Optional[str] = None

class ReasoningPlan(BaseModel):
    plan_id: str
    goal: str
    hypotheses: List[Hypothesis] = Field(default_factory=list)
    steps: List[DecisionStep] = Field(default_factory=list)
    conclusion: Optional[str] = None
    confidence_score: float = 0.0
