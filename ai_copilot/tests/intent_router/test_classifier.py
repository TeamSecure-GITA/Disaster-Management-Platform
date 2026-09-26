from intent_router.intent_classifier import IntentClassifier
from schemas.intent import IntentCategory

def test_intent_classifier_categories():
    clf = IntentClassifier()
    assert clf.classify("Order evacuation for Sector 3").category == IntentCategory.EVACUATION
    assert clf.classify("Find nearest relief shelter").category == IntentCategory.SHELTER
    assert clf.classify("Show situational dashboard").category == IntentCategory.ANALYTICS
