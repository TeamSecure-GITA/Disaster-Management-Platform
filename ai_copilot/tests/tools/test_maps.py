from tools.maps import GeocodingTool, RoutingTool, DistanceTool, NearbyFacilitiesTool, HazardMapTool

def test_maps_tools():
    assert GeocodingTool().execute().success is True
    assert RoutingTool().execute().success is True
    assert DistanceTool().execute().success is True
    assert NearbyFacilitiesTool().execute().success is True
    assert HazardMapTool().execute().success is True
