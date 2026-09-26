"""Abstract base model interface."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
from .model_config import ModelConfig
from .model_metadata import ModelMetadata
from .prediction import PredictionResult


class BaseModel(ABC):
    """Standard base class for all ML Engine estimators and forecasters."""

    def __init__(self, config: ModelConfig | None = None) -> None:
        self.config = config or ModelConfig()
        self.metadata = ModelMetadata(
            model_name=self.config.model_name,
            version=self.config.version,
            parameters=self.config.to_dict(),
        )
        self.is_fitted: bool = False

    @abstractmethod
    def fit(self, X: Any, y: Any | None = None) -> BaseModel:
        """Train the model on features X and targets y."""
        pass

    @abstractmethod
    def predict(self, X: Any) -> PredictionResult:
        """Run inference and produce a structured PredictionResult."""
        pass

    @abstractmethod
    def save(self, filepath: str) -> None:
        """Serialize model weights and metadata to disk."""
        pass

    @abstractmethod
    def load(self, filepath: str) -> BaseModel:
        """Deserialize model from disk."""
        pass
