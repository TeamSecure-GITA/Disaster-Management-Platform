from typing import Tuple

class ConfidenceChecker:
    def __init__(self, threshold: float = 0.65):
        self.threshold = threshold

    def check(self, confidence: float) -> Tuple[bool, str]:
        if confidence < self.threshold:
            return False, f"Model confidence ({confidence}) below required threshold ({self.threshold}). Human review required."
        return True, "Confidence adequate."
