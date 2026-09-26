import re
from typing import List
from schemas.safety import HallucinationCheckResult

class HallucinationGuard:
    def check_hallucinations(self, text: str, ground_truth_texts: List[str]) -> HallucinationCheckResult:
        combined = " ".join(ground_truth_texts).lower()
        # Look for casualty claims without grounding
        casualty_match = re.search(r"(\d+)\s*(dead|fatalities|casualties|killed)", text, re.I)
        if casualty_match:
            number = casualty_match.group(1)
            if number not in combined:
                return HallucinationCheckResult(
                    is_grounded=False,
                    unsupported_claims=[f"Unverified casualty count: {casualty_match.group(0)}"],
                    groundedness_score=0.4
                )
        return HallucinationCheckResult(is_grounded=True, groundedness_score=0.98)
