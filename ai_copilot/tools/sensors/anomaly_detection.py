from typing import Any, Dict
from tools.base import BaseTool

class SensorAnomalyTool(BaseTool):
    name = "anomaly_detection"
    description = "Detects sensor spikes or telemetry anomalies"
    category = "sensors"

    def run(self, **kwargs) -> Dict[str, Any]:
        return {
            "anomalies_detected": True,
            "station_id": "RIVER_GAUGE_04",
            "anomaly_type": "Rapid stage rate-of-rise exceeding 99th percentile",
            "severity": "critical"
        }
