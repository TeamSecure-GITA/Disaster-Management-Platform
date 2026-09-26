from safety.hallucination_guard import HallucinationGuard

def test_hallucination_guard():
    guard = HallucinationGuard()
    res = guard.check_hallucinations("Reported 500 fatalities in town.", ["Sensor telemetry normal, zero casualties recorded."])
    assert res.is_grounded is False
