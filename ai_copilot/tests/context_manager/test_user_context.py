from context_manager.user_context import UserContextTracker
from schemas.context import UserRole

def test_user_context():
    tracker = UserContextTracker()
    ctx = tracker.get_or_create("officer_9", role=UserRole.FIRST_RESPONDER)
    assert ctx.user_id == "officer_9"
    assert ctx.role == UserRole.FIRST_RESPONDER
