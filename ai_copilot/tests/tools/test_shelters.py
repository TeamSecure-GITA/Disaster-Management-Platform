from tools.shelters import ShelterSearchTool, ShelterCapacityTool, ShelterSafetyTool, ShelterDistanceTool

def test_shelter_tools():
    assert ShelterSearchTool().execute().success is True
    assert ShelterCapacityTool().execute().success is True
    assert ShelterSafetyTool().execute().success is True
    assert ShelterDistanceTool().execute().success is True
