from src.explainability.prediction_explanation import PredictionExplainer


def test_prediction_explanations():
    expl = PredictionExplainer.explain(
        prediction="HIGH",
        confidence=0.89,
        feature_values={"rainfall_mm": 110.0, "slope_angle": 38.0},
        contributions={"rainfall_mm": 0.42, "slope_angle": 0.28},
    )
    assert expl.prediction == "HIGH"
    assert len(expl.top_positive_factors) == 2
    assert "rainfall_mm" in expl.narrative_summary
