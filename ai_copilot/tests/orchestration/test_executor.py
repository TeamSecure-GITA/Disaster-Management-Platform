import pytest
from orchestration.tool_executor import ToolExecutor
from schemas.tool import ToolExecutionResult

def test_tool_executor_execute_tool():
    executor = ToolExecutor()
    result = executor.execute_tool("weather_forecast", {"location": "Shillong", "days": 3})
    assert isinstance(result, ToolExecutionResult)
    assert result.tool_name == "weather_forecast"
    assert result.success is True
    assert "forecast" in result.data

def test_tool_executor_unknown_tool():
    executor = ToolExecutor()
    result = executor.execute_tool("non_existent_tool_xyz", {})
    assert result.success is False
    assert "not found" in result.error

def test_tool_executor_execute_batch():
    executor = ToolExecutor()
    calls = [
        {"tool_name": "weather_forecast", "arguments": {"location": "Guwahati"}},
        {"tool_name": "sensor_status", "arguments": {"station_id": "STN-999"}}
    ]
    results = executor.execute_batch(calls)
    assert len(results) == 2
    assert results[0].success is True
    assert results[1].success is True
