from typing import Any, Dict
from tools.base import BaseTool

class SensorStatusTool(BaseTool):
    name = "sensor_status"
    description = "Checks operational health of field IoT sensors"
    category = "sensors"

    def run(self, station_id: str = "STATION_ALPHA", **kwargs) -> Dict[str, Any]:
        return {
            "station_id": station_id,
            "status": "online",
            "battery_pct": 89,
            "signal_quality": "excellent",
            "last_ping_seconds_ago": 12
        }
