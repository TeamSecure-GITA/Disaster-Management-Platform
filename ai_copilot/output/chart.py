from typing import List, Dict, Any
from schemas.output import ChartData

class ChartOutputBuilder:
    def build_water_level_chart(self, labels: List[str], values: List[float]) -> ChartData:
        return ChartData(
            chart_type="line",
            title="River Stage Progression (Meters)",
            labels=labels,
            series=[{"name": "Stage (m)", "data": values, "color": "#0284c7"}]
        )
