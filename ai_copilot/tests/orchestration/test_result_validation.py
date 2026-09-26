from orchestration.result_validator import ResultValidator
from schemas.tool import ToolExecutionResult

def test_result_validation():
    val = ResultValidator()
    assert val.validate_results([ToolExecutionResult(tool_name="test", success=True)]) is True
