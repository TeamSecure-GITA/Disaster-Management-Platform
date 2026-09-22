"""
Live IoT Sensor Telemetry WebSocket channel (/ws/telemetry).
Streams high-frequency hydrological, meteorological, and seismic data to GIS map clients.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.analytics.realtime.streams import stream_buffer, TelemetryStreamPoint

router = APIRouter()

_telemetry_subscribers: Set[WebSocket] = set()


@router.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """WebSocket stream for real-time sensor telemetry points and gauge readings."""
    await websocket.accept()
    _telemetry_subscribers.add(websocket)

    # Define point listener
    loop = asyncio.get_event_loop()

    def on_point(point: TelemetryStreamPoint):
        if websocket in _telemetry_subscribers:
            try:
                asyncio.run_coroutine_threadsafe(
                    websocket.send_json({
                        "type": "telemetry_point",
                        "data": point.to_dict(),
                    }),
                    loop,
                )
            except Exception:
                pass

    stream_buffer.subscribe(on_point)

    # Initial snapshot
    await websocket.send_json({
        "type": "connection_established",
        "channel": "telemetry",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "summary": stream_buffer.get_summary(),
    })

    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        _telemetry_subscribers.discard(websocket)
        stream_buffer.unsubscribe(on_point)
    except Exception:
        _telemetry_subscribers.discard(websocket)
        stream_buffer.unsubscribe(on_point)
