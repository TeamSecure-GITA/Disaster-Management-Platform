from knowledge.sop.retriever import SOPRetriever
from knowledge.sop.validator import SOPValidator

def test_sop_retriever():
    retriever = SOPRetriever()
    validator = SOPValidator()
    results = retriever.search_by_hazard("flood")
    assert len(results) > 0
    ok, _ = validator.validate_action_against_sop("sound_sirens", results[0]["id"])
    assert ok is True
