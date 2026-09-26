from typing import Dict, Any, List, Optional
from .base import BaseTool
from .prediction import MLPredictionTool, RiskPredictionTool, HazardPredictionTool
from .weather import CurrentWeatherTool, WeatherForecastTool, SevereWeatherTool
from .sensors import SensorStatusTool, SensorReadingsTool, SensorAnomalyTool
from .incidents import IncidentSearchTool, IncidentDetailsTool, IncidentStatusTool, IncidentCreationTool
from .shelters import ShelterSearchTool, ShelterCapacityTool, ShelterSafetyTool, ShelterDistanceTool
from .responders import ResponderSearchTool, ResponderStatusTool, ResponderAssignmentTool, ResponderDispatchTool
from .maps import GeocodingTool, RoutingTool, DistanceTool, NearbyFacilitiesTool, HazardMapTool
from .analytics import DashboardTool, TrendsTool, StatisticsTool, KPITool
from .simulation import DigitalTwinTool, ScenarioSimulationTool, WhatIfSimulationTool, EvacuationSimulationTool

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_defaults()

    def _register_defaults(self):
        tools = [
            MLPredictionTool(), RiskPredictionTool(), HazardPredictionTool(),
            CurrentWeatherTool(), WeatherForecastTool(), SevereWeatherTool(),
            SensorStatusTool(), SensorReadingsTool(), SensorAnomalyTool(),
            IncidentSearchTool(), IncidentDetailsTool(), IncidentStatusTool(), IncidentCreationTool(),
            ShelterSearchTool(), ShelterCapacityTool(), ShelterSafetyTool(), ShelterDistanceTool(),
            ResponderSearchTool(), ResponderStatusTool(), ResponderAssignmentTool(), ResponderDispatchTool(),
            GeocodingTool(), RoutingTool(), DistanceTool(), NearbyFacilitiesTool(), HazardMapTool(),
            DashboardTool(), TrendsTool(), StatisticsTool(), KPITool(),
            DigitalTwinTool(), ScenarioSimulationTool(), WhatIfSimulationTool(), EvacuationSimulationTool()
        ]
        for t in tools:
            self._tools[t.name] = t

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[str]:
        return list(self._tools.keys())
