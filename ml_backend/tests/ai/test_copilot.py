import pytest
from app.ai.copilot.agent import CopilotAgent, CopilotContext

@pytest.mark.asyncio
async def test_copilot_basic_message():
    agent = CopilotAgent()
    ctx = CopilotContext(user_id="user_1", session_id="test_sess", user_role="commander")
    response = await agent.process_message("What is the status of active flood warnings?", context=ctx)
    assert response is not None
    assert response.reply != ""
    assert response.intent != ""
