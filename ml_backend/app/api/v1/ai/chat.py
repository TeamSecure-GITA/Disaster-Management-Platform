"""
Emergency Chat API router.
Provides conversational disaster emergency guidance, protocol lookup, and public assistance.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.copilot.agent import CopilotAgent, CopilotContext

router = APIRouter(prefix="/chat", tags=["AI - Emergency Chat"])

_agent = CopilotAgent()


class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User query or situation report")
    session_id: Optional[str] = Field(None, description="Conversation session ID")
    role: str = Field("responder", description="User role: citizen, responder, commander")
    location: Optional[Dict[str, float]] = Field(None, description="Coordinates: {latitude, longitude}")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Operational context")


class ChatMessageResponse(BaseModel):
    success: bool
    session_id: str
    reply: str
    intent: str
    suggested_actions: List[str]
    citations: List[Dict[str, Any]] = []
    timestamp: str


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """Process a user or responder conversational message and return emergency guidance."""
    try:
        session = request.session_id or f"sess_{int(datetime.now(timezone.utc).timestamp())}"
        ctx = CopilotContext(
            user_id=request.role,
            session_id=session,
            user_role=request.role,
            metadata={"location": request.location, **request.context},
        )
        resp = await _agent.process_message(request.message, context=ctx)
        resp_dict = resp.to_dict()

        return ChatMessageResponse(
            success=True,
            session_id=session,
            reply=resp_dict.get("reply", "Understood. Maintaining emergency readiness."),
            intent=resp_dict.get("intent", "general_inquiry"),
            suggested_actions=resp_dict.get("actions", ["Check evacuation routes", "Confirm shelter availability"]),
            citations=resp_dict.get("citations", []),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat agent error: {exc}",
        )
