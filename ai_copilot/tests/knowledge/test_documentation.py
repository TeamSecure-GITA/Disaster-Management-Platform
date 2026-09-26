from knowledge.documentation.search import DocSearch

def test_doc_search():
    search = DocSearch()
    res = search.search("Copilot")
    assert len(res) > 0
