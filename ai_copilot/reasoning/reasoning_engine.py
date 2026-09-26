from typing import List, Dict, Any
from .evidence import EvidenceAggregator
from .hypothesis import HypothesisTester
from .planner import ReasoningPlanner
from schemas.reasoning import ReasoningPlan, DecisionStep

class ReasoningEngine:
    def __init__(self):
        self.aggregator = EvidenceAggregator()
        self.tester = HypothesisTester()
        self.planner = ReasoningPlanner()

    def reason(self, query: str, tool_results: list, knowledge_chunks: list) -> ReasoningPlan:
        evidence = self.aggregator.aggregate(tool_results, knowledge_chunks)
        hypotheses = self.tester.test_hypotheses(evidence)
        steps = [
            DecisionStep(step_number=1, thought="Assess telemetry across hydrological and meteorological stations.", observation="River levels high."),
            DecisionStep(step_number=2, thought="Synthesize shelter capacity within 5km radius.", observation="Shelter SH-CENTRAL-01 has 860 available beds.")
        ]
        return self.planner.create_plan(goal=query, hypotheses=hypotheses, steps=steps)
