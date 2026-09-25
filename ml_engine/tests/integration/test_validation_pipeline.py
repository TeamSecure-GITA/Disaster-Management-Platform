from pipelines.validation.validate_dataset import validate_dataset_file
from pipelines.validation.validate_predictions import validate_prediction_payload


def test_validation_pipeline_execution():
    rep = validate_dataset_file("datasets/test/landslide/test_landslide.csv")
    assert rep.is_valid
    assert rep.total_records > 0

    pred_res = validate_prediction_payload({
        "risk_score": 0.75,
        "confidence": 0.88,
        "risk_level": "HIGH",
    })
    assert pred_res["is_valid"]
