"""
AI API v1 Sub-Router Registry.
Aggregates all conversational, copilot, voice dispatch, situation brief, and multimodal routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from .chat import router as chat_router
from .copilot import router as copilot_router
from .voice import router as voice_router
from .brief import router as brief_router
from .report import router as report_router
from .multimodal import router as multimodal_router

ai_router = APIRouter(prefix="/ai")

ai_router.include_router(chat_router)
ai_router.include_router(copilot_router)
ai_router.include_router(voice_router)
ai_router.include_router(brief_router)
ai_router.include_router(report_router)
ai_router.include_router(multimodal_router)

router = ai_router

__all__ = [
    "ai_router",
    "router",
    "chat_router",
    "copilot_router",
    "voice_router",
    "brief_router",
    "report_router",
    "multimodal_router",
]
