"""Standard prediction result containers."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class PredictionResult:
    """Represents the output of a model inference operation."""
    model_name: str
    prediction: Any
    probability: float | None = None
    confidence_interval: tuple[float, float] | None = None
    severity: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_name": self.model_name,
            "prediction": self.prediction,
            "probability": self.probability,
            "confidence_interval": self.confidence_interval,
            "severity": self.severity,
            "metadata": self.metadata,
            "timestamp": self.timestamp,
        }
