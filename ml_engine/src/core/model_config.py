"""Model configuration dataclasses."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ModelConfig:
    """Configuration specification for ML models."""
    model_name: str = "base_hazard_model"
    version: str = "1.0.0"
    algorithm: str = "gradient_boosting"
    hyperparameters: dict[str, Any] = field(default_factory=dict)
    feature_names: list[str] = field(default_factory=list)
    target_name: str = "target"
    threshold: float = 0.5
    device: str = "cpu"
    random_seed: int = 42

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_name": self.model_name,
            "version": self.version,
            "algorithm": self.algorithm,
            "hyperparameters": self.hyperparameters,
            "feature_names": self.feature_names,
            "target_name": self.target_name,
            "threshold": self.threshold,
            "device": self.device,
            "random_seed": self.random_seed,
        }
