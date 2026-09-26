from safety.confidence_check import ConfidenceChecker

def test_confidence_checker():
    checker = ConfidenceChecker(threshold=0.7)
    assert checker.check(0.8)[0] is True
    assert checker.check(0.5)[0] is False
