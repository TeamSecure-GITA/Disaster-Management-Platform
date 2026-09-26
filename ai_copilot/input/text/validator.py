from typing import Tuple

class TextValidator:
    def __init__(self, max_length: int = 10000):
        self.max_length = max_length

    def validate(self, text: str) -> Tuple[bool, str]:
        if not text or not text.strip():
            return False, "Text input cannot be empty."
        if len(text) > self.max_length:
            return False, f"Text input exceeds maximum limit of {self.max_length} characters."
        return True, "Valid text input."
