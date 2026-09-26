from tools.simulation import DigitalTwinTool, ScenarioSimulationTool, WhatIfSimulationTool, EvacuationSimulationTool

def test_simulation_tools():
    assert DigitalTwinTool().execute().success is True
    assert ScenarioSimulationTool().execute().success is True
    assert WhatIfSimulationTool().execute().success is True
    assert EvacuationSimulationTool().execute().success is True
