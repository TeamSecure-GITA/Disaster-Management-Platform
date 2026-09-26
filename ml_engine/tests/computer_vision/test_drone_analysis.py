from __future__ import annotations
import numpy as np
from src.computer_vision.drone_analysis import DroneFrameProcessor, DroneObjectTracker

def test_drone_analysis():
    proc = DroneFrameProcessor()
    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    res = proc.process_frame(frame, timestamp=1.5)
    assert res["quality"] == "GOOD"
    tracker = DroneObjectTracker()
    tracked = tracker.update([{"box": [0, 0, 10, 10]}])
    assert "track_id" in tracked[0]
