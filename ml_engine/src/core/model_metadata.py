"""Model metadata tracking dataclass."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class ModelMetadata:
    """Tracks provenance, lineage, and performance metrics for a trained model artifact."""
    model_name: str
    version: str
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metrics: dict[str, float] = field(default_factory=dict)
    parameters: dict[str, Any] = field(default_factory=dict)
    dataset_hash: str | None = None
    author: str = "disaster-ml-team"
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "model_name": self.model_name,
            "version": self.version,
            "created_at": self.created_at,
            "metrics": self.metrics,
            "parameters": self.parameters,
            "dataset_hash": self.dataset_hash,
            "author": self.author,
            "tags": self.tags,
        }
