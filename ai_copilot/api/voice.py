from fastapi import APIRouter
from typing import Dict, Any
from schemas.input import VoiceInput
from schemas.output import CopilotResponse
from input.voice.speech_to_text import SpeechToTextService
from api.chat import handle_chat
from schemas.input import TextInput

router = APIRouter()
stt = SpeechToTextService()

@router.post("/voice", response_model=CopilotResponse)
def handle_voice(payload: VoiceInput):
    transcription = stt.transcribe(payload.audio_base64 or "", language=payload.language)
    text_input = TextInput(
        text=transcription.get("transcript", "Emergency assistance"),
        user_id=payload.user_id,
        session_id=payload.session_id
    )
    return handle_chat(text_input)
