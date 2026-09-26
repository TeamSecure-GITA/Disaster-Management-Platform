"""Vision evaluation metrics."""
from __future__ import annotations

import numpy as np


class VisionEvaluator:
    """Computes mAP, IoU, and F1-score for detection/segmentation tasks."""

    def compute_iou(self, mask_true: np.ndarray, mask_pred: np.ndarray) -> float:
        intersection = np.logical_and(mask_true, mask_pred).sum()
        union = np.logical_or(mask_true, mask_pred).sum()
        if union == 0:
            return 1.0
        return float(intersection / union)
