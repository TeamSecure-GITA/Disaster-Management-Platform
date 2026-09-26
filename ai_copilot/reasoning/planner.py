import uuid
from typing import List
from schemas.reasoning import ReasoningPlan, DecisionStep, Hypothesis, EvidenceItem

class ReasoningPlanner:
    def create_plan(self, goal: str, hypotheses: List[Hypothesis], steps: List[DecisionStep]) -> ReasoningPlan:
        confidence = hypotheses[0].likelihood if hypotheses else 0.8
        return ReasoningPlan(
            plan_id=str(uuid.uuid4()),
            goal=goal,
            hypotheses=hypotheses,
            steps=steps,
            conclusion="Prioritize resident evacuation and reinforce secondary river levees.",
            confidence_score=confidence
        )
