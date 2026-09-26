from typing import List, Dict, Any

class ConversationMemory:
    def __init__(self):
        self._history: List[Dict[str, str]] = []

    def add(self, user_msg: str, assistant_msg: str):
        self._history.append({"user": user_msg, "assistant": assistant_msg})

    def get_recent(self, n: int = 5) -> List[Dict[str, str]]:
        return self._history[-n:]
