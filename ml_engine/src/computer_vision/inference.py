"""Vision inference orchestrator."""
from __future__ import annotations

from typing import Any
import numpy as np
from .base_vision_model import BaseVisionModel
from .preprocessing import VisionPreprocessor
from .postprocessing import VisionPostprocessor


class VisionInferenceEngine:
    """Orchestrates preprocessing, model execution, and post-filtering."""

    def __init__(self, model: BaseVisionModel) -> None:
        self.model = model
        self.preprocessor = VisionPreprocessor()
        self.postprocessor = VisionPostprocessor()

    def run(self, image: np.ndarray) -> dict[str, Any]:
        preprocessed = self.preprocessor.preprocess(image)
        raw_result = self.model.predict_image(preprocessed)
        if "detections" in raw_result:
            raw_result["detections"] = self.postprocessor.filter_detections(
                raw_result["detections"], threshold=self.model.confidence_threshold
            )
        return raw_result
