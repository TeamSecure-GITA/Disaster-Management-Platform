from typing import Tuple

class ImageValidator:
    def __init__(self, max_size_mb: int = 15):
        self.max_size = max_size_mb * 1024 * 1024

    def validate(self, image_bytes: bytes, mime_type: str) -> Tuple[bool, str]:
        if not image_bytes:
            return False, "Image data cannot be empty."
        if len(image_bytes) > self.max_size:
            return False, "Image exceeds maximum allowed size."
        allowed = ["image/jpeg", "image/png", "image/webp"]
        if mime_type.lower() not in allowed:
            return False, f"Unsupported image mime type: {mime_type}"
        return True, "Valid image input."
