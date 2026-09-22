import pytest
from app.ai.safety.validation import SafetyValidator
from app.ai.safety.hallucination_check import HallucinationChecker

def test_safety_validator():
    validator = SafetyValidator()
    res = validator.validate("Evacuate Sector 2 immediately")
    assert res is not None
    assert hasattr(res, 'is_safe')

def test_hallucination_check():
    checker = HallucinationChecker()
    res = checker.check("Evacuate via North Ridge Road", ["North Ridge Road is open and accessible"])
    assert res is not None
    assert hasattr(res, 'is_consistent')
