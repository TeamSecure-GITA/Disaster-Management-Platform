from typing import Dict, Any

class PredictionOutputFormatter:
    def format_prediction_card(self, pred_data: dict) -> Dict[str, Any]:
        return {
            "type": "prediction_card",
            "hazard": pred_data.get("hazard_type", "hazard"),
            "probability": pred_data.get("probability", 0.0),
            "risk_level": pred_data.get("risk_level", "medium"),
            "summary": f"Estimated {pred_data.get('risk_level', 'medium').upper()} risk probability of {round(pred_data.get('probability', 0)*100, 1)}%."
        }
