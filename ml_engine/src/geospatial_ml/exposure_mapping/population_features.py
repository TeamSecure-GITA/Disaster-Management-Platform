from __future__ import annotations
import numpy as np

class PopulationFeatureExtractor:
    def extract_density(self, census_data: dict) -> float:
        return float(census_data.get("population_density_sqkm", 250.0))
