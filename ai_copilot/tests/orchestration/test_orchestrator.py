from orchestration.orchestrator import CopilotOrchestrator
from schemas.intent import IntentClassificationResult, IntentCategory

def test_copilot_orchestrator():
    orchestrator = CopilotOrchestrator()
    intent = IntentClassificationResult(
        category=IntentCategory.PREDICTION,
        confidence=0.9,
        slots={"hazard_type": "flood"}
    )
    res = orchestrator.orchestrate(intent)
    assert len(res["results"]) > 0
    assert res["is_valid"] is True
