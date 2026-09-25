from __future__ import annotations

from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any
import yaml


@dataclass
class TrainingConfig:
    """Unified configuration for model training sessions."""

    model_name: str = "hazard_model"
    hazard_type: str = "generic"
    algorithm: str = "random_forest"
    target_column: str = "label"
    feature_columns: list[str] = field(default_factory=list)
    hyperparameters: dict[str, Any] = field(default_factory=dict)
    test_size: float = 0.2
    random_state: int = 42
    stratify: bool = True
    cv_folds: int = 5
    eval_metric: str = "roc_auc"
    checkpoint_dir: str = "checkpoints"
    artifact_dir: str = "artifacts"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> TrainingConfig:
        valid_keys = cls.__dataclass_fields__.keys()
        filtered = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered)

    @classmethod
    def from_yaml(cls, path: str | Path) -> TrainingConfig:
        with open(path, "r") as f:
            data = yaml.safe_load(f) or {}
        return cls.from_dict(data)

    def to_yaml(self, path: str | Path) -> None:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w") as f:
            yaml.safe_dump(self.to_dict(), f, default_flow_style=False)
