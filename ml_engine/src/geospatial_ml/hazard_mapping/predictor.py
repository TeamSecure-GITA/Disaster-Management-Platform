from __future__ import annotations
import numpy as np
from .model import HazardMappingModel
from .feature_layers import FeatureLayerAssembler

class HazardMappingPredictor:
    def __init__(self) -> None:
        self.model = HazardMappingModel()
        self.layer_assembler = FeatureLayerAssembler()
    def map_hazard(self, lat_grid: np.ndarray, lon_grid: np.ndarray) -> np.ndarray:
        layers = self.layer_assembler.assemble_layers(lat_grid, lon_grid)
        return self.model.predict_hazard_intensity(layers)
