"""
AI Copilot Interactive Streaming WebSocket channel (/ws/copilot).
Streams real-time token generation, tool-execution events, and reasoning traces.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ai.copilot.agent import CopilotAgent, CopilotContext

router = APIRouter()

_agent = CopilotAgent()


@router.websocket("/ws/copilot")
async def websocket_copilot_endpoint(websocket: WebSocket):
    """Interactive bidirectional streaming channel for the tactical AI Copilot."""
    await websocket.accept()

    await websocket.send_json({
        "type": "copilot_ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "capabilities": ["multi_hazard_assessment", "evacuation_routing", "dispatch_recommendation"],
    })

    try:
        while True:
            raw_msg = await websocket.receive_text()
            try:
                data = json.loads(raw_msg)
            except Exception:
                data = {"prompt": raw_msg}

            prompt = data.get("prompt") or data.get("message") or ""
            session_id = data.get("session_id", "ws_copilot_session")

            # Acknowledge receipt
            await websocket.send_json({
                "type": "thinking",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            # Process with copilot agent
            ctx = CopilotContext(
                user_id="commander",
                session_id=session_id,
                user_role="incident_commander",
            )
            response = await _agent.process_message(prompt, context=ctx)
            resp_dict = response.to_dict()

            # Stream reply
            await websocket.send_json({
                "type": "copilot_response",
                "reply": resp_dict.get("reply", ""),
                "intent": resp_dict.get("intent", "general"),
                "actions": resp_dict.get("actions", []),
                "tools_executed": resp_dict.get("tools_executed", []),
                "confidence": resp_dict.get("confidence", 0.9),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
