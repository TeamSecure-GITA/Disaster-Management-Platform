from typing import Tuple

class EmergencyGuard:
    def intercept_immediate_peril(self, text: str) -> Tuple[bool, str]:
        keywords = ["trapped in rising water", "drowning", "suffocating", "house collapsed on people"]
        for kw in keywords:
            if kw in text.lower():
                return True, "LIFE SAFETY ESCALATION: Automatic SOS priority queue triggered."
        return False, "Standard priority."
