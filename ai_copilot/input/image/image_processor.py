import base64
from typing import Dict, Any

class ImageProcessor:
    def decode_base64(self, b64_str: str) -> bytes:
        return base64.b64decode(b64_str)

    def process(self, image_bytes: bytes) -> Dict[str, Any]:
        return {
            "size_bytes": len(image_bytes),
            "format": "jpeg",
            "is_valid": len(image_bytes) > 0
        }
