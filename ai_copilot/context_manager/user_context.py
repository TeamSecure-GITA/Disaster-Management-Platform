from typing import Optional, List
from schemas.context import UserContext, UserRole

class UserContextTracker:
    def get_or_create(self, user_id: str, role: UserRole = UserRole.INCIDENT_COMMANDER) -> UserContext:
        return UserContext(user_id=user_id, role=role)
