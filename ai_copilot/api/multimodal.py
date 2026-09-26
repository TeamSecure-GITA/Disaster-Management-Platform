from fastapi import APIRouter
from typing import Dict, Any
from schemas.input import MultimodalInput
from schemas.output import CopilotResponse
from api.chat import handle_chat
from schemas.input import TextInput
from input.image.image_classifier import ImageHazardClassifier
from input.image.image_processor import ImageProcessor

router = APIRouter()
classifier = ImageHazardClassifier()
processor = ImageProcessor()

@router.post("/multimodal", response_model=CopilotResponse)
def handle_multimodal(payload: MultimodalInput):
    extra_text = payload.text or "Multimodal disaster scene report"
    if payload.images:
        img = payload.images[0]
        if img.image_base64:
            img_bytes = processor.decode_base64(img.image_base64)
            classification = classifier.classify_hazard(img_bytes)
            extra_text += f". Image analysis: {classification.get('scene_description', '')}"

    text_input = TextInput(
        text=extra_text,
        user_id=payload.user_id,
        session_id=payload.session_id,
        location=payload.location
    )
    return handle_chat(text_input)
