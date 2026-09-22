"""
WebSocket API router proxy.
Exposes application websockets from app.websocket.
"""

from __future__ import annotations

from app.websocket import websocket_router, router

__all__ = ["websocket_router", "router"]
