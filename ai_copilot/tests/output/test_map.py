from output.map import MapOutputBuilder

def test_map_builder():
    builder = MapOutputBuilder()
    layer = builder.build_hazard_layer({"type": "Polygon", "coordinates": []})
    assert layer.layer_type == "geojson"
