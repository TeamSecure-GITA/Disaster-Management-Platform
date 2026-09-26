from context_manager.manager import ContextManager

def test_context_manager_lifecycle():
    manager = ContextManager()
    session_id = "test_session_lifecycle"

    # Get or create
    ctx = manager.get_or_create(session_id, user_id="commander_alpha")
    assert ctx.session_id == session_id
    assert ctx.user.user_id == "commander_alpha"

    # Add message
    updated_ctx = manager.add_message(session_id, role="user", content="Report flood status at Majuli", intent="prediction")
    assert len(updated_ctx.history) == 1
    assert updated_ctx.history[0].content == "Report flood status at Majuli"
    assert updated_ctx.history[0].role == "user"
