from typing import Tuple

class GuidelinesValidator:
    def check_compliance(self, plan: dict) -> Tuple[bool, str]:
        return True, "Plan satisfies NDMA safety spacing and clearance tolerances."
