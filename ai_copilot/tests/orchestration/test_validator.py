from orchestration.result_validator import ResultValidator
from schemas.tool import ToolExecutionResult

def test_result_validator_empty():
    validator = ResultValidator()
    assert validator.validate_results([]) is True

def test_result_validator_success():
    validator = ResultValidator()
    results = [
        ToolExecutionResult(tool_name="tool_a", success=False, error="timeout"),
        ToolExecutionResult(tool_name="tool_b", success=True, data={"value": 42})
    ]
    assert validator.validate_results(results) is True

def test_result_validator_all_failed():
    validator = ResultValidator()
    results = [
        ToolExecutionResult(tool_name="tool_a", success=False, error="failed"),
        ToolExecutionResult(tool_name="tool_b", success=False, error="offline")
    ]
    assert validator.validate_results(results) is False
