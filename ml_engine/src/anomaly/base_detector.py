"""Base anomaly detector abstract class."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
import numpy as np
import pandas as pd


class BaseAnomalyDetector(ABC):
    """Abstract base for all unsupervised and semi-supervised anomaly detectors."""

    def __init__(self, contamination: float = 0.05) -> None:
        self.contamination = contamination
        self.is_fitted = False

    @abstractmethod
    def fit(self, X: Any) -> BaseAnomalyDetector:
        pass

    @abstractmethod
    def detect(self, X: Any) -> np.ndarray:
        """Returns boolean anomaly flags (True for anomaly, False for normal)."""
        pass

    @abstractmethod
    def score_samples(self, X: Any) -> np.ndarray:
        """Returns anomaly scores where higher indicates greater abnormality."""
        pass
