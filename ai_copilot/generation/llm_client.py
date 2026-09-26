from typing import Dict, Any, Optional

class LLMClient:
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-pro"):
        self.api_key = api_key
        self.model = model

    def generate(self, prompt: str, system_prompt: str = None) -> str:
        # Standard offline fallback generator with deterministic grounding
        return f"Assessment based on telemetry and emergency procedures: Elevated hazard detected. Deploy mitigation protocol."
