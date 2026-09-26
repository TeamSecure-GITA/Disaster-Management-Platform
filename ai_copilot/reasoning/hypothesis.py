from typing import List
from schemas.reasoning import Hypothesis, EvidenceItem

class HypothesisTester:
    def test_hypotheses(self, evidence: List[EvidenceItem]) -> List[Hypothesis]:
        has_critical = any("critical" in e.content.lower() or "overflow" in e.content.lower() for e in evidence)
        if has_critical:
            h1 = Hypothesis(
                statement="Severe hazard escalation imminent requiring evacuation precautions.",
                likelihood=0.88,
                supporting_evidence=evidence
            )
        else:
            h1 = Hypothesis(
                statement="Conditions remain elevated but contained within municipal tolerances.",
                likelihood=0.72,
                supporting_evidence=evidence
            )
        return [h1]
