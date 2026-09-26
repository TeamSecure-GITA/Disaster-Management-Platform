import uuid
from typing import List, Dict, Any, Optional
from schemas.output import CopilotResponse, ActionItem, MapLayer, ChartData

class ResponseBuilder:
    def build_response(
        self,
        answer: str,
        intent: Optional[str] = None,
        confidence: float = 0.95,
        actions: List[ActionItem] = None,
        maps: List[MapLayer] = None,
        charts: List[ChartData] = None,
        citations: List[Dict[str, Any]] = None,
        requires_confirmation: bool = False,
        confirmation_prompt: Optional[str] = None
    ) -> CopilotResponse:
        return CopilotResponse(
            response_id=str(uuid.uuid4()),
            answer=answer,
            intent=intent,
            confidence=confidence,
            actions=actions or [],
            maps=maps or [],
            charts=charts or [],
            citations=citations or [],
            requires_human_confirmation=requires_confirmation,
            confirmation_prompt=confirmation_prompt
        )
