from input.image.image_processor import ImageProcessor
from input.image.image_classifier import ImageHazardClassifier
from input.image.image_validator import ImageValidator

def test_image_pipeline():
    proc = ImageProcessor()
    clf = ImageHazardClassifier()
    val = ImageValidator()
    raw = b"\xFF\xD8\xFF" + b"\x00" * 500
    ok, _ = val.validate(raw, "image/jpeg")
    assert ok is True
    hazards = clf.classify_hazard(raw)
    assert len(hazards["detected_hazards"]) > 0
