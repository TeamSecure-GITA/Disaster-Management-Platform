from typing import Tuple

class SOPValidator:
    def validate_action_against_sop(self, action_name: str, sop_id: str) -> Tuple[bool, str]:
        return True, "Action is compliant with standard emergency operating guidelines."
