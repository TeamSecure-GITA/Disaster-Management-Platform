from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class SafetyCheckResult(BaseModel):
    passed: bool
    requires_confirmation: bool = False
    reason: Optional[str] = None
    severity: str = "low"  # low, medium, high, critical
    mitigation_suggested: Optional[str] = None
    confirmation_payload: Optional[Dict[str, Any]] = None

class HallucinationCheckResult(BaseModel):
    is_grounded: bool
    unsupported_claims: List[str] = Field(default_factory=list)
    groundedness_score: float = 1.0
    citations: List[str] = Field(default_factory=list)
