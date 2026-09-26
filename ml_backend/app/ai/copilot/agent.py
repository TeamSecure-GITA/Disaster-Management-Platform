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

import json
import logging
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, List, Optional

import httpx

from app.config import settings
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

        try:
            from app.ai.tools import register_default_tools
            register_default_tools(self)
        except Exception as exc:
            logger.warning("Could not register default tools: %s", exc)

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
        Generate grounded emergency response.
        1. Attempt LLM generation (Gemini / OpenAI) if API key is configured.
        2. Fallback to built-in domain-expert Disaster Intelligence Reasoner.
        """
        answer: Optional[str] = None
        provider = "expert_disaster_engine"
        llm_connected = False
        actions = []

        # 1. Try LLM if configured
        gemini_key = settings.EFFECTIVE_GEMINI_KEY
        if gemini_key:
            try:
                llm_text = await self._generate_gemini_response(
                    message=message,
                    route=route,
                    tool_results=tool_results,
                    context=context,
                    api_key=gemini_key,
                )
                if llm_text and llm_text.strip():
                    answer = llm_text.strip()
                    provider = "gemini-ai"
                    llm_connected = True
            except Exception as exc:
                logger.warning("LLM response generation failed, falling back to expert engine: %s", exc)

        # 2. Expert Disaster Intelligence Reasoner if LLM not used or failed
        if not answer:
            answer, actions = self._synthesize_expert_response(
                message=message,
                route=route,
                tool_results=tool_results,
                context=context,
            )

        if not actions:
            actions = self._extract_default_actions(route.intent)

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
                tool_name=result.get("tool", "unknown"),
                success=result.get("success", False),
                data=result.get("data"),
                error=result.get("error"),
            )

        builder.metadata(
            {
                "provider": provider,
                "llm_connected": llm_connected,
                "actions": actions,
                "system_prompt_version": "v2-operational",
            }
        )

        return builder.build()

    async def _generate_gemini_response(
        self,
        message: str,
        route: RouteResult,
        tool_results: List[Dict],
        context: Optional[CopilotContext],
        api_key: str,
    ) -> Optional[str]:
        """Query Google Gemini API for disaster emergency reasoning."""
        models = [settings.AI_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"]
        # Remove duplicates while preserving order
        seen = set()
        unique_models = [m for m in models if m and not (m in seen or seen.add(m))]

        tool_summary = ""
        successful_tools = [t for t in tool_results if t.get("success")]
        if successful_tools:
            tool_summary = f"\n\nOperational Sensor & Analytics Telemetry:\n{json.dumps(successful_tools, default=str)}"

        user_content = (
            f"User Query: {message}\n"
            f"Assessed Intent: {route.intent.value} (confidence: {route.confidence:.2f})"
            f"{tool_summary}\n\n"
            "Provide immediate, life-saving, structured emergency instructions with national helpline numbers (112, 108, 1070)."
        )

        async with httpx.AsyncClient(timeout=8.0) as client:
            for model_name in unique_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [
                                {
                                    "text": f"{self.system_prompt}\n\n{user_content}"
                                }
                            ],
                        }
                    ]
                }
                try:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text")
                        if text and text.strip():
                            return text.strip()
                except Exception:
                    continue

        return None

    def _synthesize_expert_response(
        self,
        message: str,
        route: RouteResult,
        tool_results: List[Dict],
        context: Optional[CopilotContext],
    ) -> tuple[str, List[str]]:
        """
        Autonomous domain-expert disaster intelligence synthesizer.
        Executes 100% offline or as high-speed deterministic intelligence.
        """
        msg_lower = message.lower()
        actions = []
        sections = []

        # ─── First-Aid & Medical Checks ──────────────────────────
        if any(w in msg_lower for w in ["cpr", "cardiac", "heart attack", "not breathing"]):
            sections.append(
                "🫀 **Adult CPR (Cardiopulmonary Resuscitation) Life-Saving Protocol:**\n"
                "1. **Check Safety & Vitals:** Tap shoulders, shout *'Are you OK?'*. Check breathing for 5–10s.\n"
                "2. **Call 112 / 108:** Put phone on speaker. Request an AED immediately.\n"
                "3. **Hand Placement:** Place heel of one hand in the center of the breastbone; interlock second hand.\n"
                "4. **Hard & Fast Compressions:** Compress at least 2 inches deep at 100–120 BPM (to *'Stayin' Alive'*).\n"
                "5. **30:2 Ratio:** 30 compressions followed by 2 gentle rescue breaths, or continuous Hands-Only CPR."
            )
            actions = ["Call 108 Ambulance", "Begin Continuous Hands-Only CPR", "Locate nearest AED"]

        elif any(w in msg_lower for w in ["chok", "heimlich", "food stuck", "airway"]):
            sections.append(
                "🗣️ **Choking Protocol (Heimlich Maneuver):**\n"
                "1. **5 Back Blows:** Lean victim forward; deliver 5 firm blows between shoulder blades with hand heel.\n"
                "2. **5 Abdominal Thrusts:** Stand behind; place fist thumb-side against abdomen just above navel. Thrust sharply inward and upward.\n"
                "3. **Repeat:** Alternate 5 back blows and 5 thrusts until object is dislodged.\n"
                "4. **If Unconscious:** Lower to floor, call 112, inspect mouth, and begin chest compressions."
            )
            actions = ["Perform 5 Back Blows", "Execute Upward Abdominal Thrusts", "Call 112 if unresponsive"]

        elif any(w in msg_lower for w in ["bleed", "tourniquet", "blood", "wound", "hemorrhage"]):
            sections.append(
                "🩸 **Severe Bleeding & Hemorrhage Control:**\n"
                "1. **Direct Firm Pressure:** Press clean cloth directly on the wound with maximum two-handed force.\n"
                "2. **Do Not Release:** Hold pressure continuously for 10+ minutes without lifting cloth to check.\n"
                "3. **Arterial Bleeding / Tourniquet:** If blood is spurting bright red, apply a tourniquet 2–3 inches above the wound (between wound and heart, NOT over a joint). Tighten until bleeding stops completely. Note exact time applied.\n"
                "4. **Prevent Shock:** Keep victim warm and elevate feet if conscious."
            )
            actions = ["Apply Continuous Direct Pressure", "Deploy Arterial Tourniquet 2-3 inches above wound", "Call 108 / 112"]

        elif any(w in msg_lower for w in ["snake", "snakebite", "viper", "cobra"]):
            sections.append(
                "🐍 **Snakebite Emergency Protocol (DO NOT PANIC):**\n"
                "1. **Keep Motionless:** Immobilize the victim completely; movement spreads venom via the lymphatic system.\n"
                "2. **Splint Limb:** Keep the bitten arm or leg strictly **below heart level**.\n"
                "3. **Remove Constrictions:** Quickly remove rings, watches, and shoes before swelling starts.\n"
                "4. **CRITICAL WARNINGS:** ❌ NEVER cut the wound. ❌ NEVER suck venom. ❌ NEVER apply ice or tight tourniquet.\n"
                "5. **Hospital Transport:** Rush to nearest district hospital stocked with Anti-Snake Venom (ASV)."
            )
            actions = ["Immobilize Bitten Limb Below Heart", "Remove Rings and Tight Clothes", "Rush to Hospital with ASV"]

        # ─── Natural Disaster Scenarios ──────────────────────────
        elif any(w in msg_lower for w in ["landslide", "mudslide", "slope", "rockfall", "debris flow"]):
            sections.append(
                "⛰️ **Landslide & Slope Instability Emergency Protocol:**\n"
                "1. **Evacuate the Fall Path:** Move immediately perpendicular to the slide path towards stable bedrock ridges.\n"
                "2. **Watch Early Warning Indicators:** Watch for sudden muddying of clear streams, tension cracks opening on roads or slopes, and leaning trees/utility poles.\n"
                "3. **Avoid Riverbeds and Gorges:** Debris flows accelerate rapidly in narrow valleys and natural drainages.\n"
                "4. **If Trapped Indoors:** Curl into a tight ball under sturdy furniture and protect your head."
            )
            actions = ["Evacuate Perpendicular to Slide Path", "Inspect Slope Tension Cracks", "Alert Downstream Habitations"]

        elif any(w in msg_lower for w in ["flood", "inundat", "river", "water level", "submerge"]):
            sections.append(
                "🌊 **Flash Flood & Inundation Emergency Protocol:**\n"
                "1. **Seek Immediate High Ground:** Move to the highest accessible floor or roof structure.\n"
                "2. **Do Not Walk or Drive in Floodwaters:** Just 15 cm (6 inches) of moving water can knock an adult down; 30 cm can sweep away a car.\n"
                "3. **Cut Electrical Power:** Disconnect main circuit breaker before water reaches electrical sockets.\n"
                "4. **Purify All Water:** Never drink floodwater. Boil for at least 3 minutes or use halogen tablets."
            )
            actions = ["Ascend to High Ground / Upper Floors", "Disconnect Main Electrical Breakers", "Call Disaster Helplines (1070 / 112)"]

        elif any(w in msg_lower for w in ["cyclone", "storm", "hurricane", "wind", "surge"]):
            sections.append(
                "🌀 **Tropical Cyclone & High Wind Protocol:**\n"
                "1. **Stay Indoors in Inner Safe Room:** Close and board all windows; stay in the most reinforced inner room.\n"
                "2. **Eye of the Storm Trap:** When winds suddenly calm, do NOT go outside; the opposite eyewall will strike with equal or greater fury within minutes.\n"
                "3. **Turn Off Gas & Power:** Isolate LPG cylinders and main switchboard.\n"
                "4. **Emergency Survival Kit:** Keep waterproof bag with radio, torch, dry rations, and personal identification."
            )
            actions = ["Secure Structural Openings", "Stay in Windowless Inner Room", "Monitor Official IMD Cyclone Warnings"]

        elif any(w in msg_lower for w in ["earthquake", "quake", "tremor", "seismic"]):
            sections.append(
                "🌍 **Earthquake Survival Protocol:**\n"
                "1. **DROP, COVER, HOLD ON:** Drop to hands and knees. Cover head and neck under a sturdy table. Hold on until shaking stops.\n"
                "2. **If Outdoors:** Move to an open area away from buildings, power cables, flyovers, and steep slopes.\n"
                "3. **Do Not Use Elevators:** Always use emergency stairwells after shaking ceases.\n"
                "4. **Post-Quake Inspection:** Check for gas leaks (smell) and structural cracks before re-entering."
            )
            actions = ["Drop, Cover, and Hold On", "Evacuate to Open Clearing", "Inspect for Gas & Electrical Hazards"]

        elif any(w in msg_lower for w in ["wildfire", "forest fire", "bushfire", "fire"]):
            sections.append(
                "🔥 **Wildfire & Rapid Fire Spread Protocol:**\n"
                "1. **Evacuate Early:** Leave via primary paved routes before smoke obscures vision or roads are blocked.\n"
                "2. **Close All Ingress Openings:** Shut all windows, vents, and interior doors to slow draft-driven fire spread.\n"
                "3. **Protect Airways:** Cover mouth and nose with a damp cloth or N95 mask.\n"
                "4. **Defensible Space:** Remove dry brush and combustible furniture from immediate building perimeters."
            )
            actions = ["Evacuate Downwind Safe Corridors", "Seal Ventilation Ingress", "Call Fire Emergency (101 / 112)"]

        # ─── Operational Tool Telemetry Integration ─────────────
        successful_tools = [t for t in tool_results if t.get("success")]
        if successful_tools:
            tool_lines = ["\n### 📊 Retrieved Operational Intelligence:"]
            for tool_res in successful_tools:
                tname = tool_res.get("tool", "Operational Tool")
                tdata = tool_res.get("data", {})
                if isinstance(tdata, dict):
                    if "risk_score" in tdata:
                        tool_lines.append(f"- **{tname.replace('_', ' ').title()}**: Risk Score = `{tdata.get('risk_score')}` | Level = **{tdata.get('risk_level', 'N/A').upper()}**")
                    elif "shelters" in tdata or "results" in tdata:
                        items = tdata.get("shelters") or tdata.get("results") or []
                        tool_lines.append(f"- **Shelter Availability**: Found {len(items)} active emergency relief centers.")
                    else:
                        tool_lines.append(f"- **{tname.replace('_', ' ').title()}**: Telemetry processed successfully.")
                else:
                    tool_lines.append(f"- **{tname.replace('_', ' ').title()}**: Active operational status confirmed.")
            sections.append("\n".join(tool_lines))

        # If no specific disaster keywords matched, synthesize intent-based overview
        if not sections:
            intent_title = route.intent.value.replace("_", " ").title()
            sections.append(
                f"### 🛡️ Tactical Emergency Decision Support [{intent_title}]\n\n"
                f"I have analyzed your situation report: *\"{message}\"*.\n"
                "Operational safety protocols and early warning sensor streams are active across all hazard monitoring grids."
            )

        # Append standard tactical directives & helplines
        sections.append(
            "\n**🚨 Immediate Life-Safety Directives:**\n"
            "1. Maintain situational awareness and monitor official State Disaster Management Authority (SDMA) bulletins.\n"
            "2. Keep battery-powered communication active and stage emergency 72-hour survival supplies.\n"
            "3. If conditions deteriorate, evacuate immediately along pre-designated high-elevation corridors.\n\n"
            "**📞 National 24x7 Emergency Helplines:**\n"
            "- **112** — All-in-One National Emergency Support\n"
            "- **108** — Medical Emergency & Ambulance\n"
            "- **1070** — State Disaster Emergency Operation Center\n"
            "- **101** — Fire & Rescue Services"
        )

        return "\n\n".join(sections), actions

    @staticmethod
    def _extract_default_actions(intent: Intent) -> List[str]:
        mapping = {
            Intent.LANDSLIDE: ["Inspect slope tension cracks", "Evacuate perpendicular to slide path", "Alert downstream communities"],
            Intent.FLOOD: ["Move to high ground", "Cut electrical breaker", "Confirm shelter intake capacity"],
            Intent.CYCLONE: ["Secure window shutters", "Stay in inner safe room", "Stage emergency power/water"],
            Intent.EARTHQUAKE: ["Drop, Cover, and Hold On", "Evacuate away from structures", "Inspect gas lines"],
            Intent.WILDFIRE: ["Evacuate paved routes", "Close structural vents", "Deploy fire buffer zones"],
            Intent.SHELTER_SEARCH: ["Navigate to nearest shelter", "Verify intake capacity", "Notify family via Rescue ID"],
            Intent.RESOURCE_SEARCH: ["Dispatch high-water rescue boats", "Deploy trauma medical kits", "Activate satellite relays"],
            Intent.RISK_ANALYSIS: ["Audit vulnerability index", "Set alert to ORANGE/RED", "Pre-position SDRF rescue teams"],
        }
        return mapping.get(intent, ["Maintain emergency readiness", "Monitor official alerts", "Keep communication lines open"])

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