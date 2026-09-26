from intent_router.router import IntentRouter
from schemas.intent import IntentCategory

def test_intent_routing():
    router = IntentRouter()
    res = router.route("What is the flood prediction for tomorrow?")
    assert res["classification"].category == IntentCategory.PREDICTION
    assert res["routing_plan"]["requires_tools"] is True
