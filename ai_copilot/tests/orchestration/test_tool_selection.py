from orchestration.tool_selector import ToolSelector
from schemas.intent import IntentClassificationResult, IntentCategory

def test_tool_selector():
    selector = ToolSelector()
    tools = selector.select_tools(IntentClassificationResult(category=IntentCategory.SHELTER, confidence=0.9))
    assert "shelter_search" in tools
