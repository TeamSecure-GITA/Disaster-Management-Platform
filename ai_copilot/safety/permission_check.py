from typing import List, Tuple
from schemas.context import UserRole

class PermissionChecker:
    def check_permission(self, role: UserRole, action: str) -> Tuple[bool, str]:
        if role in [UserRole.INCIDENT_COMMANDER, UserRole.GOVERNMENT_OFFICIAL]:
            return True, "Authorized"
        if action in ["responder_dispatch", "evacuation_order"] and role == UserRole.CITIZEN:
            return False, "Citizens cannot issue mass evacuation or dispatch orders."
        return True, "Authorized"
