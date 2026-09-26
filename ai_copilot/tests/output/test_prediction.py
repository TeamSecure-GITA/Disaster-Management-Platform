from output.prediction import PredictionOutputFormatter

def test_prediction_formatter():
    fmt = PredictionOutputFormatter()
    card = fmt.format_prediction_card({"hazard_type": "flood", "probability": 0.85, "risk_level": "high"})
    assert card["type"] == "prediction_card"
