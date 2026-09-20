"""
AI Copilot subsystem.

The Copilot provides:
- Natural-language disaster operations assistance
- Intent detection
- Tool selection
- Context/memory management
- Safety validation
- Structured responses
"""

from .agent import CopilotAgent
from .router import IntentRouter
from .memory import ConversationMemory
from .response import CopilotResponse, ResponseBuilder

__all__ = [
    "CopilotAgent",
    "IntentRouter",
    "ConversationMemory",
    "CopilotResponse",
    "ResponseBuilder",
]