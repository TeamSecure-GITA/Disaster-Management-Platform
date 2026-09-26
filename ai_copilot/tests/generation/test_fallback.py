from generation.fallback import FallbackGenerator

def test_fallback_generator():
    fallback = FallbackGenerator()
    resp = fallback.get_fallback_response("Connection failed")
    assert "Emergency Dispatch Alert" in resp
    assert "112" in resp
