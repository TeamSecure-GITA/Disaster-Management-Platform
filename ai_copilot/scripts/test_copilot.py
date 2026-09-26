from intent_router.router import IntentRouter
from orchestration.orchestrator import CopilotOrchestrator

def main():
    router = IntentRouter()
    orchestrator = CopilotOrchestrator()
    queries = [
        "Will the river flood tonight in Sector 4?",
        "Find nearest relief shelters with spare medical beds.",
        "Order immediate evacuation for Zone 2 residents."
    ]
    for q in queries:
        print(f"\nQuery: {q}")
        res = router.route(q)
        intent = res['classification'].category.value
        conf = res['classification'].confidence
        print(f"-> Intent: {intent} (Confidence: {conf})")
        orch = orchestrator.orchestrate(res['classification'])
        print(f"-> Tools triggered: {[r.tool_name for r in orch.get('results', [])]}")
        print(f"-> Confirmation required: {orch.get('requires_confirmation')}")

if __name__ == "__main__":
    main()
