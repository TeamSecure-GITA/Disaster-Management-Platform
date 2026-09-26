import re
from typing import Dict, Any
from schemas.intent import IntentCategory, IntentClassificationResult

class IntentClassifier:
    def __init__(self):
        self.rules = {
            IntentCategory.EMERGENCY_ACTION: [
                r"\bsiren\b", r"\bbroadcast alert\b", r"\bcode red\b", r"\bscramble\b",
                r"\bimmediate dispatch\b", r"\bdispatch unit\b"
            ],
            IntentCategory.EVACUATION: [
                r"\bevacuat", r"\bleave area\b", r"\bclear zone\b", r"\bexit path\b", r"\bsafe corridor\b"
            ],
            IntentCategory.PREDICTION: [
                r"\bpredict", r"\bforecast", r"\boutlook\b", r"\bflood\b", r"\bcyclone\b",
                r"\blandslide\b", r"\bheavy rain\b", r"\bmonsoon\b", r"\brisk tomorrow\b"
            ],
            IntentCategory.SHELTER: [
                r"\bshelter", r"\brelief camp\b", r"\bsafe house\b", r"\bbeds\b", r"\bration center\b"
            ],
            IntentCategory.RESPONDER: [
                r"\brescue team\b", r"\bndrf\b", r"\bparamedic\b", r"\bambulance\b",
                r"\bfire truck\b", r"\bfirst responder\b"
            ],
            IntentCategory.INCIDENT: [
                r"\bcasualt", r"\bcollapsed\b", r"\bincident\b", r"\bbridge broken\b", r"\bactive fire\b"
            ],
            IntentCategory.RISK: [
                r"\bvulnerabilit", r"\brisk assessment\b", r"\bhazard level\b", r"\bhow dangerous\b"
            ],
            IntentCategory.ANALYTICS: [
                r"\bdashboard\b", r"\bkpi\b", r"\bstatistics\b", r"\btrends\b", r"\boverview\b"
            ],
            IntentCategory.SIMULATION: [
                r"\bsimulat", r"\bwhat if\b", r"\bdigital twin\b", r"\bscenario\b"
            ],
        }

    def classify(self, text: str) -> IntentClassificationResult:
        text_lower = text.lower()
        best_intent = IntentCategory.GENERAL
        best_score = 0.5
        matched_slots = {}

        for intent, patterns in self.rules.items():
            matches = sum(1 for p in patterns if re.search(p, text_lower))
            if matches > 0:
                score = min(0.70 + (matches * 0.15), 0.98)
                if score > best_score:
                    best_score = score
                    best_intent = intent

        # Extract basic location slots
        if "sector" in text_lower or "zone" in text_lower:
            loc_match = re.search(r"(sector\s*\d+|zone\s*\d+|district\s*[a-z]+)", text_lower)
            if loc_match:
                matched_slots["location"] = loc_match.group(1).title()

        requires_conf = best_intent in [
            IntentCategory.EVACUATION,
            IntentCategory.EMERGENCY_ACTION,
            IntentCategory.RESPONDER
        ]

        return IntentClassificationResult(
            category=best_intent,
            confidence=best_score,
            slots=matched_slots,
            requires_tools=best_intent != IntentCategory.GENERAL,
            requires_human_confirmation=requires_conf,
            explanation=f"Matched emergency intent '{best_intent.value}' based on keyword patterns."
        )
