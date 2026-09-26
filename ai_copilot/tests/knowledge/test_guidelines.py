from knowledge.guidelines.retriever import GuidelinesRetriever

def test_guidelines():
    retriever = GuidelinesRetriever()
    res = retriever.find_guideline("Evacuation")
    assert len(res) > 0
