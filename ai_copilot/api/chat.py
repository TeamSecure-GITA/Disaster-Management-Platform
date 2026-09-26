from fastapi import APIRouter
from typing import Dict, Any
from schemas.input import TextInput
from schemas.output import CopilotResponse
from intent_router.router import IntentRouter
from orchestration.orchestrator import CopilotOrchestrator
from generation.response_generator import ResponseGenerator
from output.response import ResponseBuilder
from context_manager.manager import ContextManager

router = APIRouter()
intent_router = IntentRouter()
orchestrator = CopilotOrchestrator()
generator = ResponseGenerator()
builder = ResponseBuilder()
context_mgr = ContextManager()

@router.post("/chat", response_model=CopilotResponse)
def handle_chat(payload: TextInput):
    session_id = payload.session_id or "default_session"
    context = context_mgr.get_or_create(session_id, user_id=payload.user_id or "commander")
    
    context_dict = context.model_dump()
    route_result = intent_router.route(payload.text, context=context_dict)
    classification = route_result["classification"]
    
    orch_result = orchestrator.orchestrate(classification, context=context_dict)
    
    facts = orch_result.get("synthesis_plan", {}).get("payloads", {})
    answer_text = generator.generate_response(classification.category.value, facts)
    
    context_mgr.add_message(session_id, role="user", content=payload.text, intent=classification.category.value)
    context_mgr.add_message(session_id, role="assistant", content=answer_text, intent=classification.category.value)
    
    requires_conf = orch_result.get("requires_confirmation", False)
    conf_prompt = None
    if requires_conf:
        wf = orch_result.get("workflow")
        if wf and wf.confirmation_payload:
            conf_prompt = f"CRITICAL ACTION REQUIRED: Confirmation needed for {wf.confirmation_payload.get('intent', 'action')}."

    return builder.build_response(
        answer=answer_text,
        intent=classification.category.value,
        confidence=classification.confidence,
        requires_confirmation=requires_conf,
        confirmation_prompt=conf_prompt
    )
