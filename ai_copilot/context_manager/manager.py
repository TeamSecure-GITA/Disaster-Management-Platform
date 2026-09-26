from typing import Dict, Any, Optional
from schemas.context import UnifiedContext
from .context_store import InMemoryContextStore
from .context_merger import ContextMerger
from .conversation_context import ConversationContextTracker

class ContextManager:
    def __init__(self):
        self.store = InMemoryContextStore()
        self.merger = ContextMerger()
        self.conversation_tracker = ConversationContextTracker()

    def get_or_create(self, session_id: str, user_id: str = "commander_01") -> UnifiedContext:
        ctx = self.store.get(session_id)
        if not ctx:
            ctx = UnifiedContext(session_id=session_id)
            ctx.user.user_id = user_id
            self.store.set(session_id, ctx)
        return ctx

    def update(self, session_id: str, payload: Dict[str, Any]) -> UnifiedContext:
        ctx = self.get_or_create(session_id)
        ctx = self.merger.merge(ctx, payload)
        self.store.set(session_id, ctx)
        return ctx

    def add_message(self, session_id: str, role: str, content: str, intent: str = None) -> UnifiedContext:
        ctx = self.get_or_create(session_id)
        ctx.history = self.conversation_tracker.append_turn(ctx.history, role, content, intent)
        self.store.set(session_id, ctx)
        return ctx
