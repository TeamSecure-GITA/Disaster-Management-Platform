from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class IntentCategory(str, Enum):
    GENERAL = "general"
    RISK = "risk"
    PREDICTION = "prediction"
    INCIDENT = "incident"
    SHELTER = "shelter"
    RESPONDER = "responder"
    EVACUATION = "evacuation"
    ANALYTICS = "analytics"
    SIMULATION = "simulation"
    EMERGENCY_ACTION = "emergency_action"


class IntentSlot(BaseModel):
    name: str
    value: Any
    confidence: float = 1.0
    extracted_from: Optional[str] = None


class IntentClassificationResult(BaseModel):
    category: IntentCategory
    confidence: float = Field(..., ge=0.0, le=1.0)
    secondary_category: Optional[IntentCategory] = None
    secondary_confidence: Optional[float] = None
    slots: Dict[str, Any] = Field(default_factory=dict)
    requires_tools: bool = True
    requires_human_confirmation: bool = False
    explanation: Optional[str] = None
