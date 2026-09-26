from __future__ import annotations
import numpy as np

class RiskZoningModel:
    def compute_risk(self, hazard: np.ndarray, exposure: np.ndarray, vulnerability: np.ndarray) -> np.ndarray:
        # Standard UN-ISDR formulation: Risk = Hazard x Exposure x Vulnerability
        return np.clip(hazard * exposure * vulnerability, 0.0, 1.0)
