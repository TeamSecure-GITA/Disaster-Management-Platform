"""
Real-time Incident Feed & Field Tracking WebSocket channel (/ws/incidents).
Streams updates on casualty reports, perimeter changes, and responder assignments.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

_incident_subscribers: Set[WebSocket] = set()


@router.websocket("/ws/incidents")
async def websocket_incidents_endpoint(websocket: WebSocket):
    """WebSocket stream for real-time field incident status changes and triage events."""
    await websocket.accept()
    _incident_subscribers.add(websocket)

    await websocket.send_json({
        "type": "connection_established",
        "channel": "incidents",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_monitoring": True,
    })

    try:
        while True:
            text = await websocket.receive_text()
            if text == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        _incident_subscribers.discard(websocket)
    except Exception:
        _incident_subscribers.discard(websocket)


async def broadcast_incident_update(incident_event: dict):
    """Broadcast an incident status change or new report to all operational dashboards."""
    dead = set()
    for ws in list(_incident_subscribers):
        try:
            await ws.send_json(incident_event)
        except Exception:
            dead.add(ws)
    for ws in dead:
        _incident_subscribers.discard(ws)
