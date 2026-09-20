"""
AI Copilot intent router.

Converts natural-language requests into structured
operational intents.

The router deliberately does not execute emergency actions.
It only determines what type of assistance is required.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional


class Intent(str, Enum):
    """Supported Copilot intents."""

    GENERAL = "general"

    RISK_ANALYSIS = "risk_analysis"

    PREDICTION = "prediction"

    FORECAST = "forecast"

    WEATHER = "weather"

    FLOOD = "flood"

    LANDSLIDE = "landslide"

    CYCLONE = "cyclone"

    EARTHQUAKE = "earthquake"

    WILDFIRE = "wildfire"

    MULTI_HAZARD = "multi_hazard"

    INCIDENT = "incident"

    INCIDENT_SEARCH = "incident_search"

    SHELTER_SEARCH = "shelter_search"

    RESOURCE_SEARCH = "resource_search"

    RESPONDER_SEARCH = "responder_search"

    EVACUATION = "evacuation"

    DISPATCH = "dispatch"

    SENSOR = "sensor"

    ANALYTICS = "analytics"

    SIMULATION = "simulation"

    WHAT_IF = "what_if"

    REPORT_GENERATION = "report_generation"

    SITUATION_BRIEF = "situation_brief"

    DOCUMENT_ANALYSIS = "document_analysis"

    IMAGE_ANALYSIS = "image_analysis"

    HELP = "help"

    SYSTEM_STATUS = "system_status"


@dataclass
class RouteResult:
    """Result produced by the intent router."""

    intent: Intent
    confidence: float
    entities: Dict[str, str] = field(
        default_factory=dict
    )
    requires_tool: bool = False
    requires_confirmation: bool = False
    explanation: Optional[str] = None


class IntentRouter:
    """
    Lightweight deterministic intent router.

    A learned/LLM-based router can later be plugged in,
    while this implementation remains usable offline.
    """

    KEYWORDS = {
        Intent.LANDSLIDE: [
            "landslide",
            "slope failure",
            "slope movement",
            "soil creep",
            "debris",
            "rockfall",
        ],
        Intent.FLOOD: [
            "flood",
            "flooding",
            "river overflow",
            "water level",
            "flash flood",
        ],
        Intent.CYCLONE: [
            "cyclone",
            "storm",
            "tropical storm",
            "wind warning",
        ],
        Intent.EARTHQUAKE: [
            "earthquake",
            "seismic",
            "earth tremor",
            "tremor",
            "ground shaking",
        ],
        Intent.WILDFIRE: [
            "wildfire",
            "forest fire",
            "forestfire",
            "fire risk",
        ],
        Intent.WEATHER: [
            "weather",
            "rainfall",
            "temperature",
            "humidity",
            "wind",
            "precipitation",
            "forecast",
        ],
        Intent.PREDICTION: [
            "predict",
            "prediction",
            "probability",
            "risk prediction",
            "forecast risk",
        ],
        Intent.SHELTER_SEARCH: [
            "shelter",
            "safe shelter",
            "relief camp",
            "relief centre",
            "relief center",
            "safe location",
        ],
        Intent.RESOURCE_SEARCH: [
            "resource",
            "resources",
            "equipment",
            "ambulance",
            "food",
            "water supply",
            "medical supplies",
        ],
        Intent.RESPONDER_SEARCH: [
            "responder",
            "rescue team",
            "response team",
            "fire team",
            "medical team",
        ],
        Intent.EVACUATION: [
            "evacuate",
            "evacuation",
            "evacuation route",
            "evacuation plan",
            "move people",
        ],
        Intent.DISPATCH: [
            "dispatch",
            "send team",
            "send ambulance",
            "deploy",
            "deployment",
        ],
        Intent.SENSOR: [
            "sensor",
            "telemetry",
            "iot",
            "soil sensor",
            "water sensor",
            "device status",
        ],
        Intent.INCIDENT: [
            "incident",
            "emergency",
            "accident",
            "disaster event",
        ],
        Intent.ANALYTICS: [
            "analytics",
            "statistics",
            "metrics",
            "kpi",
            "trend",
            "dashboard",
        ],
        Intent.SIMULATION: [
            "simulate",
            "simulation",
            "digital twin",
            "scenario",
        ],
        Intent.WHAT_IF: [
            "what if",
            "what happens if",
            "scenario analysis",
            "suppose",
        ],
        Intent.REPORT_GENERATION: [
            "generate report",
            "create report",
            "incident report",
            "write report",
        ],
        Intent.SITUATION_BRIEF: [
            "situation brief",
            "brief me",
            "situational awareness",
            "situation summary",
        ],
        Intent.IMAGE_ANALYSIS: [
            "analyze image",
            "analyse image",
            "photo analysis",
            "image analysis",
        ],
        Intent.DOCUMENT_ANALYSIS: [
            "analyze document",
            "analyse document",
            "read document",
            "analyze pdf",
        ],
        Intent.SYSTEM_STATUS: [
            "system status",
            "system health",
            "is system working",
            "backend status",
        ],
        Intent.HELP: [
            "help",
            "what can you do",
            "capabilities",
        ],
    }

    TOOL_INTENTS = {
        Intent.RISK_ANALYSIS,
        Intent.PREDICTION,
        Intent.FORECAST,
        Intent.WEATHER,
        Intent.FLOOD,
        Intent.LANDSLIDE,
        Intent.CYCLONE,
        Intent.EARTHQUAKE,
        Intent.WILDFIRE,
        Intent.MULTI_HAZARD,
        Intent.INCIDENT_SEARCH,
        Intent.SHELTER_SEARCH,
        Intent.RESOURCE_SEARCH,
        Intent.RESPONDER_SEARCH,
        Intent.SENSOR,
        Intent.ANALYTICS,
        Intent.SIMULATION,
        Intent.WHAT_IF,
        Intent.SYSTEM_STATUS,
    }

    CONFIRMATION_INTENTS = {
        Intent.EVACUATION,
        Intent.DISPATCH,
    }

    def route(
        self,
        message: str,
    ) -> RouteResult:

        normalized = self._normalize(
            message
        )

        scores: Dict[
            Intent,
            float
        ] = {}

        for intent, keywords in (
            self.KEYWORDS.items()
        ):

            score = 0.0

            for keyword in keywords:

                if keyword in normalized:
                    score += self._keyword_weight(
                        keyword
                    )

            if score > 0:
                scores[intent] = score

        if not scores:

            return RouteResult(
                intent=Intent.GENERAL,
                confidence=0.35,
                requires_tool=False,
                explanation=(
                    "No specialized intent "
                    "was detected."
                ),
            )

        ranked = sorted(
            scores.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        best_intent, best_score = ranked[0]

        total_score = sum(
            scores.values()
        )

        confidence = (
            best_score / total_score
            if total_score > 0
            else 0.35
        )

        confidence = min(
            max(confidence, 0.0),
            1.0,
        )

        entities = self._extract_entities(
            normalized
        )

        return RouteResult(
            intent=best_intent,
            confidence=round(
                confidence,
                4,
            ),
            entities=entities,
            requires_tool=(
                best_intent
                in self.TOOL_INTENTS
            ),
            requires_confirmation=(
                best_intent
                in self.CONFIRMATION_INTENTS
            ),
            explanation=(
                f"Detected intent: "
                f"{best_intent.value}"
            ),
        )

    @staticmethod
    def _normalize(
        message: str,
    ) -> str:

        message = message.lower().strip()

        message = re.sub(
            r"\s+",
            " ",
            message,
        )

        return message

    @staticmethod
    def _keyword_weight(
        keyword: str,
    ) -> float:

        # More specific multi-word phrases
        # receive greater weight.
        words = len(
            keyword.split()
        )

        return 1.0 + (
            0.5 * max(words - 1, 0)
        )

    @staticmethod
    def _extract_entities(
        message: str,
    ) -> Dict[str, str]:

        entities: Dict[str, str] = {}

        # Basic geographic hints.
        location_patterns = [
            r"\bin\s+([a-zA-Z][a-zA-Z .-]{2,40})",
            r"\bnear\s+([a-zA-Z][a-zA-Z .-]{2,40})",
            r"\bat\s+([a-zA-Z][a-zA-Z .-]{2,40})",
        ]

        for pattern in location_patterns:

            match = re.search(
                pattern,
                message,
            )

            if match:

                entities["location"] = (
                    match.group(1)
                    .strip(
                        " .,?"
                    )
                )

                break

        return entities