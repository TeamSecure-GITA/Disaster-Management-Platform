from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class InputModality(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    IMAGE = "image"
    DOCUMENT = "document"
    MULTIMODAL = "multimodal"


class GeoPoint(BaseModel):
    latitude: float
    longitude: float
    elevation_m: Optional[float] = None
    accuracy_m: Optional[float] = None


class TextInput(BaseModel):
    text: str = Field(..., min_length=1, description="Raw input text query")
    language: str = Field(default="en")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    location: Optional[GeoPoint] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class VoiceInput(BaseModel):
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None
    mime_type: str = Field(default="audio/wav")
    duration_seconds: Optional[float] = None
    language: str = Field(default="en")
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ImageInput(BaseModel):
    image_base64: Optional[str] = None
    image_url: Optional[str] = None
    mime_type: str = Field(default="image/jpeg")
    caption: Optional[str] = None
    location: Optional[GeoPoint] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DocumentInput(BaseModel):
    document_base64: Optional[str] = None
    document_url: Optional[str] = None
    filename: str = Field(default="document.pdf")
    mime_type: str = Field(default="application/pdf")
    doc_type: Optional[str] = Field(default="sop", description="e.g. sop, sitrep, policy")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MultimodalInput(BaseModel):
    text: Optional[str] = None
    voice: Optional[VoiceInput] = None
    images: List[ImageInput] = Field(default_factory=list)
    documents: List[DocumentInput] = Field(default_factory=list)
    location: Optional[GeoPoint] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
