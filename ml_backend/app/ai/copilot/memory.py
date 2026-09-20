"""
Conversation memory for the AI Copilot.

Stores:
- User messages
- Assistant responses
- Intent
- Important context
- Conversation metadata

The memory is bounded to prevent unbounded RAM usage.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import uuid4


@dataclass
class ConversationMessage:
    """One conversation message."""

    role: str
    content: str

    timestamp: str = field(
        default_factory=lambda:
            datetime.now(
                timezone.utc
            ).isoformat()
    )

    intent: Optional[str] = None

    metadata: Dict = field(
        default_factory=dict
    )


@dataclass
class Conversation:
    """Conversation state."""

    conversation_id: str

    messages: List[
        ConversationMessage
    ] = field(
        default_factory=list
    )

    metadata: Dict = field(
        default_factory=dict
    )

    created_at: str = field(
        default_factory=lambda:
            datetime.now(
                timezone.utc
            ).isoformat()
    )

    updated_at: str = field(
        default_factory=lambda:
            datetime.now(
                timezone.utc
            ).isoformat()
    )


class ConversationMemory:
    """
    Bounded conversation memory.

    Example:

        memory = ConversationMemory()

        conversation_id = (
            memory.create_conversation()
        )

        memory.add_message(
            conversation_id,
            "user",
            "What is the flood risk?"
        )
    """

    def __init__(
        self,
        max_conversations: int = 10_000,
        max_messages_per_conversation: int = 50,
    ):
        self.max_conversations = (
            max_conversations
        )

        self.max_messages = (
            max_messages_per_conversation
        )

        self.conversations: Dict[
            str,
            Conversation
        ] = {}

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    def create_conversation(
        self,
        conversation_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> str:

        conversation_id = (
            conversation_id
            or str(uuid4())
        )

        if (
            len(self.conversations)
            >= self.max_conversations
        ):
            self._remove_oldest()

        self.conversations[
            conversation_id
        ] = Conversation(
            conversation_id=conversation_id,
            metadata=metadata or {},
        )

        return conversation_id

    # ---------------------------------------------------------
    # Get
    # ---------------------------------------------------------

    def get(
        self,
        conversation_id: str,
    ) -> Optional[Conversation]:

        return self.conversations.get(
            conversation_id
        )

    def get_or_create(
        self,
        conversation_id: Optional[str],
    ) -> Conversation:

        if conversation_id:

            conversation = self.get(
                conversation_id
            )

            if conversation:
                return conversation

        new_id = self.create_conversation(
            conversation_id
        )

        return self.conversations[
            new_id
        ]

    # ---------------------------------------------------------
    # Messages
    # ---------------------------------------------------------

    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> ConversationMessage:

        conversation = self.get_or_create(
            conversation_id
        )

        message = ConversationMessage(
            role=role,
            content=content,
            intent=intent,
            metadata=metadata or {},
        )

        conversation.messages.append(
            message
        )

        if (
            len(conversation.messages)
            > self.max_messages
        ):
            conversation.messages = (
                conversation.messages[
                    -self.max_messages:
                ]
            )

        conversation.updated_at = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

        return message

    # ---------------------------------------------------------
    # Context
    # ---------------------------------------------------------

    def get_recent_messages(
        self,
        conversation_id: str,
        limit: int = 10,
    ) -> List[ConversationMessage]:

        conversation = self.get(
            conversation_id
        )

        if not conversation:
            return []

        return conversation.messages[
            -limit:
        ]

    def build_context(
        self,
        conversation_id: str,
        limit: int = 10,
    ) -> List[Dict]:

        messages = self.get_recent_messages(
            conversation_id,
            limit,
        )

        return [
            {
                "role": message.role,
                "content": message.content,
                "timestamp": message.timestamp,
                "intent": message.intent,
            }
            for message in messages
        ]

    # ---------------------------------------------------------
    # Metadata
    # ---------------------------------------------------------

    def update_metadata(
        self,
        conversation_id: str,
        values: Dict,
    ) -> None:

        conversation = self.get_or_create(
            conversation_id
        )

        conversation.metadata.update(
            values
        )

        conversation.updated_at = (
            datetime.now(
                timezone.utc
            ).isoformat()
        )

    # ---------------------------------------------------------
    # Delete
    # ---------------------------------------------------------

    def delete(
        self,
        conversation_id: str,
    ) -> bool:

        if conversation_id not in self.conversations:
            return False

        del self.conversations[
            conversation_id
        ]

        return True

    # ---------------------------------------------------------
    # Oldest cleanup
    # ---------------------------------------------------------

    def _remove_oldest(self) -> None:

        if not self.conversations:
            return

        oldest_id = min(
            self.conversations,
            key=lambda conversation_id:
                self.conversations[
                    conversation_id
                ].created_at,
        )

        del self.conversations[
            oldest_id
        ]

    # ---------------------------------------------------------
    # Statistics
    # ---------------------------------------------------------

    def statistics(self) -> Dict:

        total_messages = sum(
            len(conversation.messages)
            for conversation
            in self.conversations.values()
        )

        return {
            "conversations": len(
                self.conversations
            ),
            "messages": total_messages,
            "max_conversations": (
                self.max_conversations
            ),
            "max_messages_per_conversation": (
                self.max_messages
            ),
        }