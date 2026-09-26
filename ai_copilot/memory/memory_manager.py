from .short_term import ShortTermMemory
from .conversation import ConversationMemory
from .incident_memory import IncidentEpisodicMemory
from .user_memory import UserPreferenceMemory

class MemoryManager:
    def __init__(self):
        self.short_term = ShortTermMemory()
        self.conversation = ConversationMemory()
        self.incidents = IncidentEpisodicMemory()
        self.user = UserPreferenceMemory()
