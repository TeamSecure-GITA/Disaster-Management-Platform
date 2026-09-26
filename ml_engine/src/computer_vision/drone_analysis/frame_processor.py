from __future__ import annotations
import numpy as np

class DroneFrameProcessor:
    def process_frame(self, frame: np.ndarray, timestamp: float) -> dict:
        return {"timestamp": timestamp, "frame_shape": frame.shape, "quality": "GOOD"}
