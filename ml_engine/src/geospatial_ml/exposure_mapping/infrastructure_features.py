from __future__ import annotations
import numpy as np

class InfrastructureFeatureExtractor:
    def extract_critical_assets(self, geo_data: dict) -> dict:
        return {"hospitals_count": 3, "power_substations": 1, "bridges": 4}
