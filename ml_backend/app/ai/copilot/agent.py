"""
AI Disaster Management Copilot agent.

Pipeline:

User message
     |
     v
Intent Router
     |
     v
Conversation Memory
     |
     v
Safety / confirmation analysis
     |
     v
Tool selection
     |
     v
Tool execution
     |
     v
Response synthesis
     |
     v
Structured response
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, List, Optional

from .memory import ConversationMemory
from .prompts import (
    build_help_prompt,
    build_system_prompt,
)
from .response import (
    CopilotResponse,
    ResponseBuilder,
)
from .router import (
    Intent,
    IntentRouter,
    RouteResult,
)


logger = logging.getLogger(
    "disaster-management.copilot"
)


ToolCallable = Callable[
    [Dict[str, Any]],
    Awaitable[Any],
]


@dataclass
class CopilotContext:
    """Runtime context supplied to the Copilot."""

    user_id: Optional[str] = None
    location: Optional[Dict[str, Any]] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    user_role: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.user_role and not self.role:
            self.role = self.user_role


class CopilotAgent:
    """
    Main AI Copilot.

    The class is intentionally provider-agnostic.

    An LLM can later be attached through:
        generate_response()

    Tools can be registered dynamically.
    """

    def __init__(
        self,
        router: Optional[
            IntentRouter
        ] = None,
        memory: Optional[
            ConversationMemory
        ] = None,
    ):

        self.router = (
            router
            or IntentRouter()
        )

        self.memory = (
            memory
            or ConversationMemory()
        )

        self.tools: Dict[
            str,
            ToolCallable
        ] = {}

        self.system_prompt = (
            build_system_prompt()
        )

    # ========================================================
    # Tool registration
    # ========================================================

    def register_tool(
        self,
        name: str,
        function: ToolCallable,
    ) -> None:

        if not name.strip():
            raise ValueError(
                "Tool name cannot be empty."
            )

        self.tools[name] = function

        logger.info(
            "Copilot tool registered: %s",
            name,
        )

    def unregister_tool(
        self,
        name: str,
    ) -> bool:

        if name not in self.tools:
            return False

        del self.tools[name]

        return True

    # ========================================================
    # Main execution
    # ========================================================

    async def process(
        self,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[
            CopilotContext
        ] = None,
    ) -> CopilotResponse:

        if not message or not message.strip():

            conversation_id = (
                conversation_id
                or self.memory.create_conversation()
            )

            return (
                ResponseBuilder(
                    conversation_id,
                    Intent.GENERAL.value,
                    0.0,
                )
                .failure(
                    "Message cannot be empty."
                )
                .build()
            )

        conversation = (
            self.memory.get_or_create(
                conversation_id
            )
        )

        conversation_id = (
            conversation.conversation_id
        )

        # ----------------------------------------------------
        # Route request
        # ----------------------------------------------------

        route = self.router.route(
            message
        )

        # ----------------------------------------------------
        # Store user message
        # ----------------------------------------------------

        self.memory.add_message(
            conversation_id=conversation_id,
            role="user",
            content=message,
            intent=route.intent.value,
            metadata={
                "route_confidence": (
                    route.confidence
                ),
                "entities": route.entities,
            },
        )

        # ----------------------------------------------------
        # Handle help directly
        # ----------------------------------------------------

        if route.intent == Intent.HELP:

            response = (
                ResponseBuilder(
                    conversation_id,
                    route.intent.value,
                    route.confidence,
                )
                .answer(
                    build_help_prompt()
                )
                .build()
            )

            self._store_assistant_response(
                conversation_id,
                response,
            )

            return response

        # ----------------------------------------------------
        # Human confirmation
        # ----------------------------------------------------

        if route.requires_confirmation:

            answer = (
                "This request may involve a "
                "high-impact emergency action. "
                "I can provide decision-support "
                "information, but execution requires "
                "explicit confirmation by an "
                "authorized human operator."
            )

            response = (
                ResponseBuilder(
                    conversation_id,
                    route.intent.value,
                    route.confidence,
                )
                .answer(answer)
                .human_confirmation(True)
                .metadata(
                    {
                        "action_blocked": True,
                        "reason": (
                            "human_confirmation_required"
                        ),
                    }
                )
                .build()
            )

            self._store_assistant_response(
                conversation_id,
                response,
            )

            return response

        # ----------------------------------------------------
        # Tool execution
        # ----------------------------------------------------

        tool_results = []

        if route.requires_tool:

            tool_results = (
                await self._execute_tools(
                    route,
                    message,
                    context,
                )
            )

        # ----------------------------------------------------
        # Generate response
        # ----------------------------------------------------

        response = await self.generate_response(
            message=message,
            route=route,
            conversation_id=conversation_id,
            context=context,
            tool_results=tool_results,
        )

        self._store_assistant_response(
            conversation_id,
            response,
        )

        return response

    # ========================================================
    # Tool execution
    # ========================================================

    async def _execute_tools(
        self,
        route: RouteResult,
        message: str,
        context: Optional[
            CopilotContext
        ],
    ) -> List[Dict]:

        tool_name = self._map_intent_to_tool(
            route.intent
        )

        if not tool_name:
            return []

        tool = self.tools.get(
            tool_name
        )

        if not tool:
            logger.warning(
                "No tool registered for intent=%s",
                route.intent.value,
            )

            return [
                {
                    "tool": tool_name,
                    "success": False,
                    "error": (
                        "Required tool is not "
                        "currently available."
                    ),
                }
            ]

        payload = {
            "message": message,
            "intent": route.intent.value,
            "entities": route.entities,
            "context": (
                context.__dict__
                if context
                else {}
            ),
        }

        try:

            result = await tool(
                payload
            )

            return [
                {
                    "tool": tool_name,
                    "success": True,
                    "data": result,
                }
            ]

        except Exception as exc:

            logger.exception(
                "Copilot tool failed: %s",
                tool_name,
            )

            return [
                {
                    "tool": tool_name,
                    "success": False,
                    "error": str(exc),
                }
            ]

    # ========================================================
    # Intent → tool
    # ========================================================

    @staticmethod
    def _map_intent_to_tool(
        intent: Intent,
    ) -> Optional[str]:

        mapping = {
            Intent.RISK_ANALYSIS: "risk_analysis",
            Intent.PREDICTION: "prediction",
            Intent.FORECAST: "forecast",
            Intent.WEATHER: "weather",
            Intent.FLOOD: "flood_prediction",
            Intent.LANDSLIDE: "landslide_prediction",
            Intent.CYCLONE: "cyclone_prediction",
            Intent.EARTHQUAKE: "earthquake_analysis",
            Intent.WILDFIRE: "wildfire_prediction",
            Intent.MULTI_HAZARD: "multi_hazard_prediction",
            Intent.SHELTER_SEARCH: "shelter_search",
            Intent.RESOURCE_SEARCH: "resource_search",
            Intent.RESPONDER_SEARCH: "responder_search",
            Intent.SENSOR: "sensor_status",
            Intent.ANALYTICS: "analytics",
            Intent.SIMULATION: "simulation",
            Intent.WHAT_IF: "what_if",
            Intent.INCIDENT_SEARCH: "incident_search",
            Intent.SYSTEM_STATUS: "system_health",
        }

        return mapping.get(intent)

    # ========================================================
    # Response generation
    # ========================================================

    async def generate_response(
        self,
        message: str,
        route: RouteResult,
        conversation_id: str,
        context: Optional[
            CopilotContext
        ],
        tool_results: List[Dict],
    ) -> CopilotResponse:

        """
        Generate final response.

        Current implementation provides deterministic
        fallback responses.

        Replace/extend this method with the actual LLM
        provider when the AI service is connected.
        """

        answer = self._fallback_response(
            route,
            tool_results,
        )

        builder = (
            ResponseBuilder(
                conversation_id,
                route.intent.value,
                route.confidence,
            )
            .answer(answer)
        )

        for result in tool_results:

            builder.add_tool_result(
                tool_name=result.get(
                    "tool",
                    "unknown",
                ),
                success=result.get(
                    "success",
                    False,
                ),
                data=result.get("data"),
                error=result.get("error"),
            )

        builder.metadata(
            {
                "provider": "deterministic-fallback",
                "llm_connected": False,
                "system_prompt_version": "v1",
            }
        )

        return builder.build()

    # ========================================================
    # Fallback response
    # ========================================================

    @staticmethod
    def _fallback_response(
        route: RouteResult,
        tool_results: List[Dict],
    ) -> str:

        if not tool_results:

            return (
                "I identified this as a "
                f"{route.intent.value.replace('_', ' ')} "
                "request. The corresponding operational "
                "data source or AI service is not "
                "connected yet."
            )

        successful = [
            result
            for result in tool_results
            if result.get("success")
        ]

        if not successful:

            return (
                "The required operational tool is "
                "currently unavailable. No unsupported "
                "data has been generated."
            )

        return (
            "The requested operational analysis "
            "has been retrieved. The detailed result "
            "will be presented from the connected "
            "disaster-management data source."
        )

    # ========================================================
    # Store assistant message
    # ========================================================

    def _store_assistant_response(
        self,
        conversation_id: str,
        response: CopilotResponse,
    ) -> None:

        self.memory.add_message(
            conversation_id=conversation_id,
            role="assistant",
            content=response.answer,
            intent=response.intent,
            metadata={
                "success": response.success,
                "tool_count": len(
                    response.tool_results
                ),
                "human_confirmation": (
                    response
                    .requires_human_confirmation
                ),
            },
        )

    # ========================================================
    # Conversation context
    # ========================================================

    def get_conversation_context(
        self,
        conversation_id: str,
        limit: int = 10,
    ) -> List[Dict]:

        return self.memory.build_context(
            conversation_id,
            limit,
        )

    # ========================================================
    # Health
    # ========================================================

    def health(self) -> Dict:

        return {
            "status": "healthy",
            "registered_tools": len(
                self.tools
            ),
            "memory": (
                self.memory.statistics()
            ),
            "llm_connected": False,
        }

    process_message = process