"""
Provider-agnostic flood-risk model wrapper.

No ML framework is required at import time. A trained estimator can be
injected or loaded when available.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass(frozen=True)
class FloodModelMetadata:
    name: str = "flood-risk-model"
    version: str = "v1"
    model_type: str = "unknown"
    trained: bool = False
    calibrated: bool = False
    feature_names: tuple[str, ...] = ()
    target_name: str = "flood_risk"
    description: str = (
        "Model for estimating flood risk from hydrological, "
        "meteorological, terrain and infrastructure features."
    )
    training_dataset: Optional[str] = None
    training_date: Optional[str] = None
    notes: tuple[str, ...] = ()


@dataclass
class ModelPrediction:
    score: Optional[float]
    label: Optional[Any] = None
    probabilities: Optional[dict[str, float]] = None
    status: str = "ok"
    warnings: list[str] = field(default_factory=list)


class FloodModel:
    """Generic wrapper around a trained flood-risk estimator."""

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[FloodModelMetadata] = None,
    ) -> None:
        self.estimator = estimator
        self.metadata = metadata or FloodModelMetadata(
            trained=estimator is not None
        )

    @property
    def is_loaded(self) -> bool:
        return self.estimator is not None

    @property
    def feature_names(self) -> tuple[str, ...]:
        return self.metadata.feature_names

    def load(
        self,
        path: str | Path,
        metadata_path: str | Path | None = None,
    ) -> None:
        model_path = Path(path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Flood model file not found: {model_path}"
            )

        with model_path.open("rb") as file:
            self.estimator = pickle.load(file)

        if metadata_path is not None:
            meta_path = Path(metadata_path)

            if meta_path.exists():
                with meta_path.open(
                    "r",
                    encoding="utf-8",
                ) as file:
                    raw = json.load(file)

                self.metadata = FloodModelMetadata(
                    name=raw.get("name", self.metadata.name),
                    version=raw.get(
                        "version",
                        self.metadata.version,
                    ),
                    model_type=raw.get(
                        "model_type",
                        self.metadata.model_type,
                    ),
                    trained=raw.get("trained", True),
                    calibrated=raw.get(
                        "calibrated",
                        self.metadata.calibrated,
                    ),
                    feature_names=tuple(
                        raw.get(
                            "feature_names",
                            self.metadata.feature_names,
                        )
                    ),
                    target_name=raw.get(
                        "target_name",
                        self.metadata.target_name,
                    ),
                    description=raw.get(
                        "description",
                        self.metadata.description,
                    ),
                    training_dataset=raw.get(
                        "training_dataset",
                        self.metadata.training_dataset,
                    ),
                    training_date=raw.get(
                        "training_date",
                        self.metadata.training_date,
                    ),
                    notes=tuple(
                        raw.get(
                            "notes",
                            self.metadata.notes,
                        )
                    ),
                )

    def save(
        self,
        path: str | Path,
        metadata_path: str | Path | None = None,
    ) -> None:
        if self.estimator is None:
            raise RuntimeError(
                "Cannot save an unloaded flood model."
            )

        model_path = Path(path)
        model_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with model_path.open("wb") as file:
            pickle.dump(self.estimator, file)

        if metadata_path is not None:
            meta_path = Path(metadata_path)
            meta_path.parent.mkdir(
                parents=True,
                exist_ok=True,
            )

            with meta_path.open(
                "w",
                encoding="utf-8",
            ) as file:
                json.dump(
                    asdict(self.metadata),
                    file,
                    indent=2,
                    default=list,
                )

    @staticmethod
    def _prepare_input(
        features: Sequence[float],
    ) -> list[list[float]]:
        return [[float(value) for value in features]]

    def predict_proba(
        self,
        features: Sequence[float],
    ) -> ModelPrediction:
        if self.estimator is None:
            return ModelPrediction(
                score=None,
                status="model_not_loaded",
                warnings=[
                    "No trained flood model is loaded."
                ],
            )

        if not hasattr(
            self.estimator,
            "predict_proba",
        ):
            return self.predict(features)

        try:
            probabilities = self.estimator.predict_proba(
                self._prepare_input(features)
            )

            row = probabilities[0]

            score = float(row[-1])
            score = max(0.0, min(1.0, score))

            probability_map = {
                str(index): float(value)
                for index, value in enumerate(row)
            }

            return ModelPrediction(
                score=score,
                probabilities=probability_map,
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[
                    f"Flood probability inference failed: {exc}"
                ],
            )

    def predict(
        self,
        features: Sequence[float],
    ) -> ModelPrediction:
        if self.estimator is None:
            return ModelPrediction(
                score=None,
                status="model_not_loaded",
                warnings=[
                    "No trained flood model is loaded."
                ],
            )

        try:
            if hasattr(
                self.estimator,
                "predict_proba",
            ):
                return self.predict_proba(features)

            if not hasattr(self.estimator, "predict"):
                return ModelPrediction(
                    score=None,
                    status="unsupported_model",
                    warnings=[
                        "Estimator exposes neither "
                        "predict_proba nor predict."
                    ],
                )

            output = self.estimator.predict(
                self._prepare_input(features)
            )

            label = output[0]

            try:
                score = float(label)
            except (TypeError, ValueError):
                score = None

            if score is not None:
                score = max(
                    0.0,
                    min(1.0, score),
                )

            return ModelPrediction(
                score=score,
                label=label,
                warnings=(
                    []
                    if score is not None
                    else [
                        "Estimator returned a class label "
                        "rather than a probability score."
                    ]
                ),
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[
                    f"Flood model inference failed: {exc}"
                ],
            )

    def feature_importance(self) -> dict[str, float]:
        if self.estimator is None:
            return {}

        importance = getattr(
            self.estimator,
            "feature_importances_",
            None,
        )

        if importance is None:
            return {}

        names = self.feature_names or tuple(
            f"feature_{i}"
            for i in range(len(importance))
        )

        return {
            name: float(value)
            for name, value in zip(
                names,
                importance,
            )
        }

    def health(self) -> dict[str, Any]:
        return {
            "component": "flood_model",
            "status": (
                "healthy"
                if self.is_loaded
                else "not_loaded"
            ),
            "loaded": self.is_loaded,
            "trained": self.metadata.trained,
            "calibrated": self.metadata.calibrated,
            "name": self.metadata.name,
            "version": self.metadata.version,
            "model_type": self.metadata.model_type,
            "feature_count": len(
                self.metadata.feature_names
            ),
        }