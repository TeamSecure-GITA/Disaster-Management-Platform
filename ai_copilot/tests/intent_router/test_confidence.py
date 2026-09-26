from intent_router.confidence import ConfidenceEvaluator

def test_confidence_evaluation():
    evaluator = ConfidenceEvaluator()
    score = evaluator.evaluate(matched_keywords_count=2, semantic_similarity=0.85)
    assert 0.0 <= score <= 1.0
