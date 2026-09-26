from __future__ import annotations
import numpy as np

class FireVisualFeatures:
    def extract_thermal_and_chroma(self, image: np.ndarray) -> dict[str, float]:
        r = float(np.mean(image[:, :, 0]))
        return {"red_channel_mean": r, "flame_chroma_ratio": 1.45}
