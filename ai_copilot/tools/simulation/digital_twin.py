from typing import Any, Dict
from tools.base import BaseTool

class DigitalTwinTool(BaseTool):
    name = "digital_twin"
    description = "Queries digital twin infrastructure state"
    category = "simulation"

    def run(self, asset_id: str = "DAM_KHARDI", **kwargs) -> Dict[str, Any]:
        return {
            "asset_id": asset_id,
            "current_storage_pct": 98.4,
            "inflow_cumecs": 1400,
            "outflow_cumecs": 1200
        }
