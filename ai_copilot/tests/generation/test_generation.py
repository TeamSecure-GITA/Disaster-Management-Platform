from generation.response_generator import ResponseGenerator

def test_response_generator_basic():
    generator = ResponseGenerator()
    resp = generator.generate_response(intent="risk", facts={"risk_level": "high"})
    assert "Situational Analysis" in resp
    assert "RISK" in resp
    assert "Recommended Actions" in resp
