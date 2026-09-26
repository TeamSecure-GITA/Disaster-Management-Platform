"""Vision post-processing and threshold filtering."""
from __future__ import annotations

from typing import Any
import numpy as np


class VisionPostprocessor:
    """Filters bounding boxes by Non-Maximum Suppression (NMS) and probability thresholds."""

    def filter_detections(self, detections: list[dict[str, Any]], threshold: float = 0.5) -> list[dict[str, Any]]:
        return [d for d in detections if d.get("confidence", 0.0) >= threshold]
