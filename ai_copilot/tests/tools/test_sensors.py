from tools.sensors import SensorStatusTool, SensorReadingsTool, SensorAnomalyTool

def test_sensor_tools():
    assert SensorStatusTool().execute().success is True
    assert SensorReadingsTool().execute().success is True
    assert SensorAnomalyTool().execute().success is True
