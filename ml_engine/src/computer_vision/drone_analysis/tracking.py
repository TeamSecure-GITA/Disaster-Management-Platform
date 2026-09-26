from __future__ import annotations

class DroneObjectTracker:
    def update(self, detections: list[dict]) -> list[dict]:
        # Assign track IDs
        for idx, det in enumerate(detections):
            det["track_id"] = idx + 1
        return detections
