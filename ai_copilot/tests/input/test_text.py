from input.text.parser import TextParser
from input.text.normalizer import TextNormalizer
from input.text.validator import TextValidator

def test_text_parser():
    parser = TextParser()
    res = parser.parse("SOS! Trapped near 18.5204, 73.8567 due to rising flood waters.")
    assert res["is_emergency_flagged"] is True
    assert len(res["detected_coordinates"]) == 1

def test_text_normalizer_and_validator():
    norm = TextNormalizer()
    val = TextValidator(max_length=100)
    cleaned = norm.normalize("   Help   needed!   ")
    assert cleaned == "Help needed!"
    ok, _ = val.validate(cleaned)
    assert ok is True
