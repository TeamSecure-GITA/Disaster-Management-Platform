import pandas as pd
from src.feature_engineering.hazard import HazardFeatureExtractor


def test_hazard_compounds():
    df = pd.DataFrame({
        "rainfall_mm": [60.0],
        "slope_angle": [35.0],
        "soil_moisture": [45.0],
        "water_level": [4.8],
        "flow_rate": [120.0],
        "temperature": [34.0],
        "humidity": [35.0],
        "wind_speed": [75.0],
        "storm_surge": [2.5],
    })
    ext = HazardFeatureExtractor()
    res = ext.transform(df)
    assert "landslide_susceptibility_index" in res.columns
    assert "flood_potential_index" in res.columns
    assert "fire_danger_index" in res.columns
    assert "cyclone_power_dissipation_index" in res.columns
    assert res["landslide_susceptibility_index"].iloc[0] > 0
