from tools.responders import ResponderSearchTool, ResponderStatusTool, ResponderAssignmentTool, ResponderDispatchTool

def test_responder_tools():
    assert ResponderSearchTool().execute().success is True
    assert ResponderStatusTool().execute().success is True
    assert ResponderAssignmentTool().execute(unit_id="U1", incident_id="I1").success is True
    assert ResponderDispatchTool().execute(unit_id="U1", target_location="Loc1").success is True
