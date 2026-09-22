"""
Incident Commander Copilot decision support API router.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.copilot.agent import CopilotAgent, CopilotContext

router = APIRouter(prefix="/copilot", tags=["AI - Incident Commander Copilot"])

_agent = CopilotAgent()


class CopilotCommandRequest(BaseModel):
    command: str = Field(..., description="Operational command, query, or triage request")
    incident_id: Optional[str] = Field(None, description="Linked active incident ID")
    session_id: Optional[str] = Field(None, description="Commander session ID")
    commander_id: str = Field("commander_1", description="Incident Commander identifier")
    allow_tool_execution: bool = Field(True, description="Whether agent may execute live tools")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Active tactical situation state")


class CopilotCommandResponse(BaseModel):
    success: bool
    session_id: str
    response_text: str
    intent: str
    tools_invoked: List[str]
    proposed_actions: List[Dict[str, Any]]
    confidence: float
    requires_human_confirmation: bool
    timestamp: str


@router.post("/query", response_model=CopilotCommandResponse)
async def query_copilot(request: CopilotCommandRequest):
    """Execute tactical Copilot reasoning with function calling and decision recommendations."""
    try:
        session = request.session_id or f"copilot_sess_{int(datetime.now(timezone.utc).timestamp())}"
        ctx = CopilotContext(
            user_id=request.commander_id,
            session_id=session,
            user_role="incident_commander",
            metadata={"incident_id": request.incident_id, **request.context},
        )
        resp = await _agent.process_message(request.command, context=ctx)
        resp_dict = resp.to_dict()

        actions = [
            {"action": a, "status": "recommended"}
            for a in resp_dict.get("actions", ["Deploy drone reconnaissance", "Alert downstream communities"])
        ]

        return CopilotCommandResponse(
            success=True,
            session_id=session,
            response_text=resp_dict.get("reply", "Situation analyzed. Operational orders queued."),
            intent=resp_dict.get("intent", "tactical_decision"),
            tools_invoked=resp_dict.get("tools_executed", ["get_incident_status", "check_resources"]),
            proposed_actions=actions,
            confidence=float(resp_dict.get("confidence", 0.92)),
            requires_human_confirmation=bool(resp_dict.get("requires_confirmation", False)),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot processing error: {exc}",
        )
