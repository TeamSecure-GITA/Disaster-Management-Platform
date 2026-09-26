"""Model registry for versioning and staging models."""
from __future__ import annotations

from pathlib import Path
from typing import Any
from .base_model import BaseModel
from .exceptions import ModelNotFoundError


class ModelRegistry:
    """In-memory and file-backed model registry."""

    def __init__(self, storage_path: str | Path = "models/trained") -> None:
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._models: dict[str, dict[str, BaseModel]] = {}

    def register(self, model_name: str, version: str, model: BaseModel) -> None:
        """Register a model instance by name and version."""
        if model_name not in self._models:
            self._models[model_name] = {}
        self._models[model_name][version] = model

    def get(self, model_name: str, version: str = "latest") -> BaseModel:
        """Retrieve a registered model."""
        if model_name not in self._models or not self._models[model_name]:
            raise ModelNotFoundError(f"Model '{model_name}' not found in registry.")
        
        versions = self._models[model_name]
        if version == "latest":
            latest_v = sorted(versions.keys())[-1]
            return versions[latest_v]
        
        if version not in versions:
            raise ModelNotFoundError(f"Version '{version}' for model '{model_name}' not found.")
        return versions[version]

    def list_models(self) -> dict[str, list[str]]:
        """List all registered model names and their versions."""
        return {name: list(versions.keys()) for name, versions in self._models.items()}
