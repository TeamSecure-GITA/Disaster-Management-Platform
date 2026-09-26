from typing import Dict, Any
from schemas.output import ActionItem

class ActionBuilder:
    def create_action(self, title: str, description: str, urgency: str = "immediate") -> ActionItem:
        return ActionItem(
            action_id=f"ACT-{hash(title) % 10000}",
            title=title,
            description=description,
            urgency=urgency
        )
