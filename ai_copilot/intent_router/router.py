from typing import Dict, Any
from schemas.intent import IntentClassificationResult, IntentCategory
from .intent_classifier import IntentClassifier
from .intents import (
    GeneralIntentHandler, RiskIntentHandler, PredictionIntentHandler,
    IncidentIntentHandler, ShelterIntentHandler, ResponderIntentHandler,
    EvacuationIntentHandler, AnalyticsIntentHandler, SimulationIntentHandler,
    EmergencyActionIntentHandler
)

class IntentRouter:
    def __init__(self):
        self.classifier = IntentClassifier()
        self.handlers = {
            IntentCategory.GENERAL: GeneralIntentHandler(),
            IntentCategory.RISK: RiskIntentHandler(),
            IntentCategory.PREDICTION: PredictionIntentHandler(),
            IntentCategory.INCIDENT: IncidentIntentHandler(),
            IntentCategory.SHELTER: ShelterIntentHandler(),
            IntentCategory.RESPONDER: ResponderIntentHandler(),
            IntentCategory.EVACUATION: EvacuationIntentHandler(),
            IntentCategory.ANALYTICS: AnalyticsIntentHandler(),
            IntentCategory.SIMULATION: SimulationIntentHandler(),
            IntentCategory.EMERGENCY_ACTION: EmergencyActionIntentHandler()
        }

    def route(self, text: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        classification = self.classifier.classify(text)
        handler = self.handlers.get(classification.category, self.handlers[IntentCategory.GENERAL])
        plan = handler.handle(classification.slots, context or {})
        return {
            "classification": classification,
            "routing_plan": plan
        }
