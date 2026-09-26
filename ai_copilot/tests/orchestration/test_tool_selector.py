from schemas.intent import IntentClassificationResult, IntentCategory
from orchestration.tool_selector import ToolSelector

def test_tool_selector_mapping():
    selector = ToolSelector()
    intent = IntentClassificationResult(
        category=IntentCategory.PREDICTION,
        confidence=0.92,
        slots={"hazard_type": "landslide"}
    )
    tools = selector.select_tools(intent)
    assert "ml_prediction" in tools
    assert "weather_forecast" in tools

    shelter_intent = IntentClassificationResult(
        category=IntentCategory.SHELTER,
        confidence=0.88,
        slots={}
    )
    shelter_tools = selector.select_tools(shelter_intent)
    assert "shelter_search" in shelter_tools
