"""Base vision model interface."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
import numpy as np


class BaseVisionModel(ABC):
    """Abstract base class for vision classifiers, segmenters, and object detectors."""

    def __init__(self, input_size: tuple[int, int] = (224, 224), confidence_threshold: float = 0.5) -> None:
        self.input_size = input_size
        self.confidence_threshold = confidence_threshold
        self.is_loaded = False

    @abstractmethod
    def predict_image(self, image: np.ndarray) -> dict[str, Any]:
        pass
