from tools.incidents import IncidentSearchTool, IncidentDetailsTool, IncidentStatusTool, IncidentCreationTool

def test_incident_tools():
    assert IncidentSearchTool().execute().success is True
    assert IncidentDetailsTool().execute().success is True
    assert IncidentStatusTool().execute().success is True
    assert IncidentCreationTool().execute().success is True
