"""
Provider-agnostic cyclone risk/intensity model wrapper.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass(frozen=True)
class CycloneModelMetadata:
    name: str = "cyclone-risk-model"
    version: str = "v1"
    model_type: str = "unknown"
    trained: bool = False
    calibrated: bool = False
    feature_names: tuple[str, ...] = ()
    target_name: str = "cyclone_risk"
    description: str = (
        "Model for estimating cyclone-related hazard risk "
        "from atmospheric, oceanic and geographical features."
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


class CycloneModel:
    """Generic wrapper around a trained cyclone model."""

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[CycloneModelMetadata] = None,
    ) -> None:
        self.estimator = estimator
        self.metadata = metadata or CycloneModelMetadata(
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
                f"Cyclone model file not found: {model_path}"
            )

        with model_path.open("rb") as file:
            self.estimator = pickle.load(file)

        if metadata_path is None:
            return

        meta_path = Path(metadata_path)

        if not meta_path.exists():
            return

        with meta_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            raw = json.load(file)

        self.metadata = CycloneModelMetadata(
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
                "Cannot save an unloaded cyclone model."
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
    def _input(
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
                    "No trained cyclone model is loaded."
                ],
            )

        if not hasattr(
            self.estimator,
            "predict_proba",
        ):
            return self.predict(features)

        try:
            probabilities = self.estimator.predict_proba(
                self._input(features)
            )

            row = probabilities[0]
            score = max(
                0.0,
                min(1.0, float(row[-1])),
            )

            return ModelPrediction(
                score=score,
                probabilities={
                    str(index): float(value)
                    for index, value in enumerate(row)
                },
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[
                    f"Cyclone probability inference failed: {exc}"
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
                    "No trained cyclone model is loaded."
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
                        "Estimator does not expose "
                        "predict_proba or predict."
                    ],
                )

            output = self.estimator.predict(
                self._input(features)
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
                        "instead of a probability."
                    ]
                ),
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[
                    f"Cyclone model inference failed: {exc}"
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
            f"feature_{index}"
            for index in range(len(importance))
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
            "component": "cyclone_model",
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