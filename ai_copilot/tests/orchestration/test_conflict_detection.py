from orchestration.conflict_detector import ConflictDetector

def test_conflict_detector():
    detector = ConflictDetector()
    assert isinstance(detector.detect_conflicts([]), list)
