from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from schemas.intent import IntentCategory, IntentSlot, IntentClassificationResult

class IntentDefinition(BaseModel):
    category: IntentCategory
    description: str
    sample_utterances: List[str] = Field(default_factory=list)
    required_slots: List[str] = Field(default_factory=list)
    requires_confirmation: bool = False
    priority: int = 1
