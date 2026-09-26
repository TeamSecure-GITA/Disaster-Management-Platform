from typing import List
from schemas.context import ConversationTurn

class ConversationContextTracker:
    def append_turn(self, turns: List[ConversationTurn], role: str, content: str, intent: str = None) -> List[ConversationTurn]:
        turn = ConversationTurn(role=role, content=content, intent=intent)
        turns.append(turn)
        # Keep last 20 turns
        return turns[-20:]
