from src.ingestion.river import RiverIngestion
from src.ingestion.soil import SoilIngestion
from src.ingestion.geotechnical import GeotechnicalIngestion
from src.ingestion.seismic import SeismicIngestion


def test_sensor_data_ingestion():
    river = RiverIngestion()
    soil = SoilIngestion()
    geo = GeotechnicalIngestion()
    seismic = SeismicIngestion()

    obs_r = river.ingest([{"water_level": 4.5, "flow_rate": 120.0}])
    assert obs_r[0].values["water_level"] == 4.5

    obs_s = soil.ingest([{"soil_moisture": 38.5, "soil_temperature": 21.0}])
    assert obs_s[0].values["soil_moisture"] == 38.5

    obs_g = geo.ingest([{"slope_angle": 35.0, "factor_of_safety": 1.15}])
    assert obs_g[0].values["slope_angle"] == 35.0

    obs_eq = seismic.ingest([{"magnitude": 5.4, "pga": 0.18}])
    assert obs_eq[0].values["magnitude"] == 5.4
