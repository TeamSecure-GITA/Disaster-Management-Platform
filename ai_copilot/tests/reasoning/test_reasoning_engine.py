from reasoning.reasoning_engine import ReasoningEngine

def test_reasoning_engine():
    engine = ReasoningEngine()
    plan = engine.reason("Assess rising flood risk", tool_results=[], knowledge_chunks=[])
    assert plan.confidence_score > 0.0
