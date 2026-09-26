from safety.hallucination_guard import HallucinationGuard

def test_hallucination_grounded_text():
    guard = HallucinationGuard()
    res = guard.check_hallucinations("Heavy rainfall reported.", ["Heavy rainfall reported across district."])
    assert res.is_grounded is True
    assert res.groundedness_score >= 0.9

def test_hallucination_unverified_casualties():
    guard = HallucinationGuard()
    res = guard.check_hallucinations("50 dead in incident zone", ["Water level is normal."])
    assert res.is_grounded is False
    assert len(res.unsupported_claims) > 0
