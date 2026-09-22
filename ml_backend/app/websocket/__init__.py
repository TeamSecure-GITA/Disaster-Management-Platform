"""
WebSocket Layer for Disaster Management Platform.
Provides real-time bidirectional streaming for:
- Emergency broadcast alerts & sirens (/ws/alerts)
- Live IoT sensor telemetry streams (/ws/telemetry)
- Realtime field incident status & responder tracks (/ws/incidents)
- Streaming AI Copilot tokens & tool call events (/ws/copilot)
"""

from __future__ import annotations

from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from .alerts import router as alerts_router
from .telemetry import router as telemetry_router
from .incidents import router as incidents_router
from .copilot import router as copilot_router

websocket_router = APIRouter(tags=["WebSockets"])

websocket_router.include_router(alerts_router)
websocket_router.include_router(telemetry_router)
websocket_router.include_router(incidents_router)
websocket_router.include_router(copilot_router)

router = websocket_router


class ConnectionManager:
    """Manages active WebSocket connections by channel."""

    def __init__(self):
        self._channels: Dict[str, Set[WebSocket]] = {
            "alerts": set(),
            "telemetry": set(),
            "incidents": set(),
            "copilot": set(),
        }

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()
        if channel not in self._channels:
            self._channels[channel] = set()
        self._channels[channel].add(websocket)

    def disconnect(self, channel: str, websocket: WebSocket):
        if channel in self._channels:
            self._channels[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel in self._channels:
            dead_sockets = set()
            for ws in list(self._channels[channel]):
                try:
                    await ws.send_json(message)
                except Exception:
                    dead_sockets.add(ws)
            for ws in dead_sockets:
                self._channels[channel].discard(ws)


connection_manager = ConnectionManager()

__all__ = [
    "websocket_router",
    "router",
    "connection_manager",
    "alerts_router",
    "telemetry_router",
    "incidents_router",
    "copilot_router",
]
