import base64
from typing import Dict, Any

class AudioProcessor:
    def process_audio_bytes(self, audio_data: bytes, mime_type: str = "audio/wav") -> Dict[str, Any]:
        size_bytes = len(audio_data)
        return {
            "size_bytes": size_bytes,
            "mime_type": mime_type,
            "duration_estimate_sec": round(size_bytes / 32000.0, 2),
            "is_processable": size_bytes > 0
        }

    def decode_base64(self, b64_str: str) -> bytes:
        return base64.b64decode(b64_str)
