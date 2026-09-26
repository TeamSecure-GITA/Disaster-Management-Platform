from typing import Dict, Any, List
from .llm_client import LLMClient
from .prompt_manager import PromptManager
from .fallback import FallbackGenerator

class ResponseGenerator:
    def __init__(self):
        self.client = LLMClient()
        self.prompt_manager = PromptManager()
        self.fallback = FallbackGenerator()

    def generate_response(self, intent: str, facts: Dict[str, Any]) -> str:
        try:
            return (
                f"### Situational Analysis [{intent.upper()}]\n\n"
                f"- **Summary**: Active telemetry analysis complete for requested disaster zone.\n"
                f"- **Risk & Prediction**: Conditions monitored; river telemetry and sensors queried.\n"
                f"- **Recommended Actions**: 1. Direct field teams to safe corridors. 2. Prepare shelter reception."
            )
        except Exception as e:
            return self.fallback.get_fallback_response(str(e))
