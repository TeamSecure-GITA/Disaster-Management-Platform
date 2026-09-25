from __future__ import annotations

import numpy as np
import pandas as pd
from .base import BaseFeatureExtractor


class GeotechnicalFeatureExtractor(BaseFeatureExtractor):
    """Calculates slope stability metrics, pore pressure ratios, and displacement dynamics."""

    def __init__(self, internal_friction_angle_deg: float = 30.0) -> None:
        self.friction_angle_rad = np.radians(internal_friction_angle_deg)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        slope = self.safe_series(df, "slope_angle", 15.0)
        disp = self.safe_series(df, "displacement", 0.0)
        pore = self.safe_series(df, "pore_pressure", 0.0)
        fos = self.safe_series(df, "factor_of_safety", 1.5)
        crack = self.safe_series(df, "crack_width", 0.0)

        slope_rad = np.radians(slope)

        # Gravitational shear stress component proportional to sin(slope)
        df["gravitational_shear_index"] = np.sin(slope_rad)

        # Limit equilibrium ratio: tan(slope) / tan(friction_angle)
        tan_slope = np.tan(slope_rad)
        tan_phi = np.tan(self.friction_angle_rad)
        df["slope_friction_ratio"] = tan_slope / (tan_phi if tan_phi > 1e-4 else 1e-4)

        # Inferred instability when FOS < 1.2
        df["is_critical_fos"] = (fos < 1.2).astype(int)

        # Pore pressure destabilization proxy
        df["pore_pressure_impact"] = pore * np.sin(slope_rad)

        # Displacement dynamic rate if sequence
        if len(df) > 1:
            df["displacement_velocity"] = disp.diff().fillna(0.0)
            df["crack_dilation_rate"] = crack.diff().fillna(0.0)
        else:
            df["displacement_velocity"] = 0.0
            df["crack_dilation_rate"] = 0.0

        return df
