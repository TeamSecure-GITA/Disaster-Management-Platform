from reasoning.reasoning_engine import ReasoningEngine

def test_reasoning_engine_workflow():
    engine = ReasoningEngine()
    plan = engine.reason("Assess flood risk in River Basin", tool_results=[], knowledge_chunks=[])
    assert plan.goal == "Assess flood risk in River Basin"
    assert len(plan.steps) > 0
    assert plan.hypotheses is not None
