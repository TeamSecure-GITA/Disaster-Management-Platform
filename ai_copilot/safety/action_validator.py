from typing import Dict, Any, Tuple
from .safety_policy import SafetyPolicy

class ActionValidator:
    def __init__(self):
        self.policy = SafetyPolicy()

    def validate_action(self, action_name: str, payload: Dict[str, Any]) -> Tuple[bool, str]:
        if self.policy.requires_confirmation(action_name):
            return True, "Action requires explicit incident commander confirmation."
        return True, "Action validated for autonomous execution."
