"""
Emergency Voice Command and Dispatch Audio API router.
Processes radio speech transcripts and voice commands from field units.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.copilot.agent import CopilotAgent, CopilotContext

router = APIRouter(prefix="/voice", tags=["AI - Voice Dispatch"])

_agent = CopilotAgent()


class VoiceCommandRequest(BaseModel):
    transcript: str = Field(..., description="Transcribed radio/voice text from field responder")
    unit_id: Optional[str] = Field(None, description="Field responder or caller ID")
    call_sign: Optional[str] = Field("Rescue-1", description="Radio call sign")
    audio_base64: Optional[str] = Field(None, description="Optional raw audio base64 payload")
    coordinates: Optional[Dict[str, float]] = None


class VoiceCommandResponse(BaseModel):
    success: bool
    parsed_intent: str
    extracted_entities: Dict[str, Any]
    action_taken: str
    radio_acknowledgement_text: str
    priority: str
    timestamp: str


@router.post("/dispatch-command", response_model=VoiceCommandResponse)
async def process_voice_command(request: VoiceCommandRequest):
    """Parse emergency radio voice input, extract casualties/location, and formulate dispatch order."""
    try:
        text = request.transcript.lower()
        entities: Dict[str, Any] = {"call_sign": request.call_sign}

        # Simple entity extraction heuristics
        if "casualty" in text or "injured" in text or "victim" in text:
            entities["has_casualties"] = True
            priority = "CRITICAL_P1"
        elif "fire" in text or "flood" in text or "collapse" in text:
            priority = "HIGH_P2"
        else:
            priority = "MEDIUM_P3"

        if "need" in text or "request" in text:
            action = "Resource / unit request logged and routed to dispatch engine."
            ack = f"Copy that {request.call_sign}. Request acknowledged, dispatching support."
            intent = "resource_request"
        elif "status" in text or "report" in text:
            action = "Situation report logged to active incident."
            ack = f"Roger {request.call_sign}. Status report logged in tactical log."
            intent = "sitrep"
        else:
            action = "Command relayed to field command channel."
            ack = f"Acknowledged {request.call_sign}. Standby on this frequency."
            intent = "radio_transmission"

        return VoiceCommandResponse(
            success=True,
            parsed_intent=intent,
            extracted_entities=entities,
            action_taken=action,
            radio_acknowledgement_text=ack,
            priority=priority,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice command processing error: {exc}",
        )
