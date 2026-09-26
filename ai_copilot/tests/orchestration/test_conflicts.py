from orchestration.conflict_detector import ConflictDetector
from schemas.tool import ToolExecutionResult

def test_conflict_detector_no_conflict():
    detector = ConflictDetector()
    results = [
        ToolExecutionResult(tool_name="weather_forecast", success=True, data={"forecast": "rain"}),
        ToolExecutionResult(tool_name="ml_prediction", success=True, data={"risk_level": "critical", "probability": 0.85})
    ]
    conflicts = detector.detect_conflicts(results)
    assert len(conflicts) == 0

def test_conflict_detector_critical_discrepancy():
    detector = ConflictDetector()
    results = [
        ToolExecutionResult(tool_name="ml_prediction", success=True, data={"risk_level": "critical", "probability": 0.2})
    ]
    conflicts = detector.detect_conflicts(results)
    assert len(conflicts) == 1
    assert "critical risk discrepancy" in conflicts[0]
