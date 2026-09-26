from typing import Any, Dict
from tools.base import BaseTool

class SensorReadingsTool(BaseTool):
    name = "sensor_readings"
    description = "Gets latest physical telemetry values"
    category = "sensors"

    def run(self, sensor_type: str = "piezometer", **kwargs) -> Dict[str, Any]:
        return {
            "sensor_type": sensor_type,
            "reading": 138.4,
            "unit": "kPa",
            "threshold": 120.0,
            "is_breached": True
        }
