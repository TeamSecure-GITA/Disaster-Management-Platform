from typing import Tuple

class VoiceValidator:
    def __init__(self, max_size_mb: int = 25):
        self.max_size_bytes = max_size_mb * 1024 * 1024

    def validate(self, audio_bytes: bytes, mime_type: str) -> Tuple[bool, str]:
        if not audio_bytes:
            return False, "Audio stream or file is empty."
        if len(audio_bytes) > self.max_size_bytes:
            return False, "Audio exceeds allowable size limit."
        allowed_mimes = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm", "audio/x-m4a"]
        if mime_type.lower() not in allowed_mimes:
            return False, f"Unsupported audio mime type: {mime_type}"
        return True, "Valid audio input."
