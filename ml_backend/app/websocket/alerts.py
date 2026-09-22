"""
Emergency Broadcast Alert WebSocket channel (/ws/alerts).
Pushes real-time sirens, evacuation notices, and critical hazard triggers to connected clients.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

_alert_subscribers: Set[WebSocket] = set()


@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """WebSocket stream for real-time emergency hazard sirens and evacuation broadcasts."""
    await websocket.accept()
    _alert_subscribers.add(websocket)

    # Send initial connection handshake
    await websocket.send_json({
        "type": "connection_established",
        "channel": "alerts",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "active_alert_level": "ELEVATED",
        "message": "Connected to disaster siren and emergency broadcast stream.",
    })

    try:
        while True:
            # Keep connection open and accept ping/pong or client acknowledgements
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        _alert_subscribers.discard(websocket)
    except Exception:
        _alert_subscribers.discard(websocket)


async def broadcast_alert(alert_data: dict):
    """Utility function to broadcast emergency alert to all connected operators and sirens."""
    dead = set()
    for ws in list(_alert_subscribers):
        try:
            await ws.send_json(alert_data)
        except Exception:
            dead.add(ws)
    for ws in dead:
        _alert_subscribers.discard(ws)
