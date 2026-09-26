from typing import Dict, Any
from schemas.output import CopilotResponse

class StructuredOutputParser:
    def parse_to_schema(self, raw_llm_text: str) -> Dict[str, Any]:
        return {
            "answer": raw_llm_text,
            "actions": ["Notify Incident Commander", "Verify river barrier sensors"]
        }
