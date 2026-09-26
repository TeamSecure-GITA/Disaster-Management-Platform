from typing import Dict, Any

class TokenUsageTracker:
    def __init__(self):
        self.total_tokens = 0

    def add(self, count: int):
        self.total_tokens += count

    def get_total(self) -> int:
        return self.total_tokens
