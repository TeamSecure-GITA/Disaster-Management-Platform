from schemas.context import UnifiedContext
from context_manager.context_store import InMemoryContextStore

def test_context_store_crud():
    store = InMemoryContextStore()
    session_id = "sess_store_01"

    # Initially none
    assert store.get(session_id) is None

    # Set context
    ctx = UnifiedContext(session_id=session_id)
    store.set(session_id, ctx)
    retrieved = store.get(session_id)
    assert retrieved is not None
    assert retrieved.session_id == session_id

    # Delete context
    store.delete(session_id)
    assert store.get(session_id) is None
