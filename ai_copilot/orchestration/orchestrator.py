from typing import Dict, Any, List
from schemas.intent import IntentClassificationResult
from .tool_selector import ToolSelector
from .tool_executor import ToolExecutor
from .result_validator import ResultValidator
from .conflict_detector import ConflictDetector
from .response_planner import ResponsePlanner
from .workflow import WorkflowBuilder

class CopilotOrchestrator:
    def __init__(self):
        self.selector = ToolSelector()
        self.executor = ToolExecutor()
        self.validator = ResultValidator()
        self.conflict_detector = ConflictDetector()
        self.planner = ResponsePlanner()
        self.workflow_builder = WorkflowBuilder()

    def orchestrate(self, intent_result: IntentClassificationResult, context: Dict[str, Any] = None) -> Dict[str, Any]:
        tools_to_run = self.selector.select_tools(intent_result)
        workflow = self.workflow_builder.build_workflow(
            intent=intent_result.category.value,
            tool_names=tools_to_run,
            base_args=intent_result.slots
        )
        
        # Check human confirmation
        if intent_result.requires_human_confirmation:
            workflow.requires_confirmation = True
            workflow.confirmation_payload = {
                "intent": intent_result.category.value,
                "actions": tools_to_run,
                "parameters": intent_result.slots
            }
            return {
                "workflow": workflow,
                "requires_confirmation": True,
                "results": []
            }

        calls = [{"tool_name": step.tool_name, "arguments": step.arguments} for step in workflow.steps]
        results = self.executor.execute_batch(calls)
        is_valid = self.validator.validate_results(results)
        conflicts = self.conflict_detector.detect_conflicts(results)
        synthesis_plan = self.planner.plan_synthesis(intent_result.category.value, results)

        return {
            "workflow": workflow,
            "results": results,
            "is_valid": is_valid,
            "conflicts": conflicts,
            "synthesis_plan": synthesis_plan,
            "requires_confirmation": False
        }
