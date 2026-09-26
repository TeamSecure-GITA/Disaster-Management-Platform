from safety.source_check import SourceChecker

def test_source_checker():
    checker = SourceChecker()
    assert checker.verify_sources([{"id": "doc1"}])[0] is True
    assert checker.verify_sources([])[0] is False
