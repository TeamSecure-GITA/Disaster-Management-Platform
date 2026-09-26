from typing import Dict, Optional
from schemas.context import UnifiedContext

class InMemoryContextStore:
    def __init__(self):
        self._store: Dict[str, UnifiedContext] = {}

    def get(self, session_id: str) -> Optional[UnifiedContext]:
        return self._store.get(session_id)

    def set(self, session_id: str, context: UnifiedContext) -> None:
        self._store[session_id] = context

    def delete(self, session_id: str) -> None:
        if session_id in self._store:
            del self._store[session_id]
