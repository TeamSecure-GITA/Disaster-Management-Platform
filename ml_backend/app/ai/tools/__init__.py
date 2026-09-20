"""
AI tools for the Disaster Management Copilot.
"""

from __future__ import annotations

from typing import Any

from .incident_tools import IncidentTools
from .risk_tools import RiskTools
from .shelter_tools import ShelterTools
from .responder_tools import ResponderTools
from .sensor_tools import SensorTools
from .weather_tools import WeatherTools
from .map_tools import MapTools
from .prediction_tools import PredictionTools
from .analytics_tools import AnalyticsTools
from .simulation_tools import SimulationTools


def register_default_tools(
    agent: Any,
    *,
    incident_service: Any = None,
    risk_engine: Any = None,
    shelter_service: Any = None,
    responder_service: Any = None,
    sensor_service: Any = None,
    weather_service: Any = None,
    map_service: Any = None,
    prediction_service: Any = None,
    analytics_service: Any = None,
    simulation_service: Any = None,
) -> None:
    """
    Register all AI tools with a CopilotAgent.

    Services are optional. This allows the application to start before all
    external systems have been configured.
    """

    incidents = IncidentTools(incident_service)
    risks = RiskTools(risk_engine)
    shelters = ShelterTools(shelter_service)
    responders = ResponderTools(responder_service)
    sensors = SensorTools(sensor_service)
    weather = WeatherTools(weather_service)
    maps = MapTools(map_service)
    predictions = PredictionTools(prediction_service)
    analytics = AnalyticsTools(analytics_service)
    simulations = SimulationTools(simulation_service)

    # Incident tools
    agent.register_tool("incident_search", incidents.search_incidents)
    agent.register_tool("get_incident", incidents.get_incident)
    agent.register_tool("incident_summary", incidents.incident_summary)
    agent.register_tool("create_incident", incidents.create_incident)

    # Risk
    agent.register_tool("risk_analysis", risks.analyze_risk)
    agent.register_tool("risk_comparison", risks.compare_risk)
    agent.register_tool("risk_factors", risks.get_risk_factors)

    # Shelters
    agent.register_tool("shelter_search", shelters.search_shelters)
    agent.register_tool("get_shelter", shelters.get_shelter)
    agent.register_tool("shelter_capacity", shelters.shelter_capacity)

    # Responders
    agent.register_tool("responder_search", responders.search_responders)
    agent.register_tool("get_responder", responders.get_responder)
    agent.register_tool("responder_status", responders.responder_status)

    # Sensors
    agent.register_tool("sensor_status", sensors.sensor_status)
    agent.register_tool("get_telemetry", sensors.get_telemetry)
    agent.register_tool("detect_anomaly", sensors.detect_anomaly)

    # Weather
    agent.register_tool("weather", weather.current_weather)
    agent.register_tool("weather_forecast", weather.forecast)
    agent.register_tool("rainfall", weather.rainfall)

    # Maps
    agent.register_tool("geocode", maps.geocode)
    agent.register_tool("reverse_geocode", maps.reverse_geocode)
    agent.register_tool("route", maps.route)
    agent.register_tool("nearby", maps.nearby)

    # Predictions
    agent.register_tool("prediction", predictions.predict)
    agent.register_tool(
        "landslide_prediction",
        predictions.landslide_prediction,
    )
    agent.register_tool(
        "flood_prediction",
        predictions.flood_prediction,
    )
    agent.register_tool(
        "cyclone_prediction",
        predictions.cyclone_prediction,
    )
    agent.register_tool(
        "earthquake_analysis",
        predictions.earthquake_analysis,
    )
    agent.register_tool(
        "wildfire_prediction",
        predictions.wildfire_prediction,
    )
    agent.register_tool(
        "multi_hazard_prediction",
        predictions.multi_hazard_prediction,
    )

    # Analytics
    agent.register_tool("analytics", analytics.dashboard)
    agent.register_tool("trends", analytics.trends)
    agent.register_tool("kpis", analytics.kpis)
    agent.register_tool("model_metrics", analytics.model_metrics)

    # Simulation
    agent.register_tool("simulation", simulations.simulate)
    agent.register_tool("what_if", simulations.what_if)
    agent.register_tool(
        "evacuation_simulation",
        simulations.evacuation_simulation,
    )
    agent.register_tool(
        "digital_twin",
        simulations.digital_twin,
    )


__all__ = [
    "IncidentTools",
    "RiskTools",
    "ShelterTools",
    "ResponderTools",
    "SensorTools",
    "WeatherTools",
    "MapTools",
    "PredictionTools",
    "AnalyticsTools",
    "SimulationTools",
    "register_default_tools",
]