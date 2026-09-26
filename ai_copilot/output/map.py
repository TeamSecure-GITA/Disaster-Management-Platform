from typing import Dict, Any
from schemas.output import MapLayer

class MapOutputBuilder:
    def build_hazard_layer(self, geojson_data: dict, title: str = "Active Flood Zone") -> MapLayer:
        return MapLayer(
            layer_type="geojson",
            title=title,
            data=geojson_data,
            style={"fillColor": "#FF0000", "weight": 2, "opacity": 0.7}
        )
