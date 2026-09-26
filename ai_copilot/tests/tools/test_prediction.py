from tools.prediction import MLPredictionTool, RiskPredictionTool, HazardPredictionTool

def test_prediction_tools():
    ml = MLPredictionTool()
    res = ml.execute(hazard_type="landslide")
    assert res.success is True
    assert res.data["risk_level"] == "critical"
    
    risk = RiskPredictionTool()
    assert risk.execute().success is True
    
    hazard = HazardPredictionTool()
    assert hazard.execute().success is True
