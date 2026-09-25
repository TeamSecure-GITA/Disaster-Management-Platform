import pandas as pd
from src.preprocessing.validation import DataValidator


def test_data_validation():
    validator = DataValidator(required_columns=["latitude", "longitude", "rainfall_mm"])
    valid_df = pd.DataFrame({
        "latitude": [25.0],
        "longitude": [85.0],
        "rainfall_mm": [45.0],
    })
    rep = validator.validate(valid_df)
    assert rep.is_valid
    assert rep.passed_records == 1

    invalid_df = pd.DataFrame({
        "latitude": [120.0],  # Out of range > 90
        "longitude": [85.0],
    })
    rep_inv = validator.validate(invalid_df)
    assert not rep_inv.is_valid  # Missing rainfall_mm
