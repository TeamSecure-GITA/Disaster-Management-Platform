"""
Provider-agnostic landslide model wrapper.

The wrapper intentionally does not require scikit-learn, XGBoost, LightGBM,
PyTorch, etc. at import time.

A trained estimator can be injected when available. If no estimator is
loaded, inference returns `model_not_loaded` rather than fabricating a risk
prediction.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass(frozen=True)
class LandslideModelMetadata:
    """Metadata describing a landslide model."""

    name: str = "landslide-risk-model"
    version: str = "v1"
    model_type: str = "unknown"
    trained: bool = False
    calibrated: bool = False
    feature_names: tuple[str, ...] = ()
    target_name: str = "landslide_risk"
    description: str = (
        "Model wrapper for landslide risk estimation. "
        "A score represents model output, not a deterministic prediction."
    )
    training_dataset: Optional[str] = None
    training_date: Optional[str] = None
    notes: tuple[str, ...] = ()


@dataclass
class ModelPrediction:
    """Raw prediction returned by the model wrapper."""

    score: Optional[float]
    label: Optional[Any] = None
    probabilities: Optional[dict[str, float]] = None
    status: str = "ok"
    warnings: list[str] = field(default_factory=list)


class LandslideModel:
    """
    Generic wrapper around a trained estimator.

    Supported estimator interfaces:
        - predict_proba(X)
        - predict(X)

    The estimator is intentionally treated as an external dependency.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[LandslideModelMetadata] = None,
    ) -> None:
        self.estimator = estimator
        self.metadata = metadata or LandslideModelMetadata(
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
        """Load a serialized estimator and optional metadata."""

        model_path = Path(path)

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        with model_path.open("rb") as file:
            self.estimator = pickle.load(file)

        metadata = self.metadata

        if metadata_path is not None:
            meta_path = Path(metadata_path)

            if meta_path.exists():
                with meta_path.open("r", encoding="utf-8") as file:
                    raw = json.load(file)

                metadata = LandslideModelMetadata(
                    name=raw.get("name", metadata.name),
                    version=raw.get("version", metadata.version),
                    model_type=raw.get("model_type", metadata.model_type),
                    trained=raw.get("trained", True),
                    calibrated=raw.get("calibrated", metadata.calibrated),
                    feature_names=tuple(
                        raw.get("feature_names", metadata.feature_names)
                    ),
                    target_name=raw.get(
                        "target_name",
                        metadata.target_name,
                    ),
                    description=raw.get(
                        "description",
                        metadata.description,
                    ),
                    training_dataset=raw.get(
                        "training_dataset",
                        metadata.training_dataset,
                    ),
                    training_date=raw.get(
                        "training_date",
                        metadata.training_date,
                    ),
                    notes=tuple(raw.get("notes", metadata.notes)),
                )

        self.metadata = metadata

    def save(
        self,
        path: str | Path,
        metadata_path: str | Path | None = None,
    ) -> None:
        """Persist the estimator and optional metadata."""

        if self.estimator is None:
            raise RuntimeError("Cannot save an unloaded landslide model.")

        model_path = Path(path)
        model_path.parent.mkdir(parents=True, exist_ok=True)

        with model_path.open("wb") as file:
            pickle.dump(self.estimator, file)

        if metadata_path is not None:
            meta_path = Path(metadata_path)
            meta_path.parent.mkdir(parents=True, exist_ok=True)

            with meta_path.open("w", encoding="utf-8") as file:
                json.dump(
                    asdict(self.metadata),
                    file,
                    indent=2,
                    default=list,
                )

    def _prepare_input(
        self,
        features: Sequence[float],
    ) -> list[list[float]]:
        """Convert a feature vector to estimator input format."""

        return [[float(value) for value in features]]

    def predict_proba(
        self,
        features: Sequence[float],
    ) -> ModelPrediction:
        """
        Return a probability-like model output when supported.

        For binary classifiers, the positive class is normally the second
        probability returned by predict_proba().
        """

        if self.estimator is None:
            return ModelPrediction(
                score=None,
                status="model_not_loaded",
                warnings=["No trained landslide model is loaded."],
            )

        if not hasattr(self.estimator, "predict_proba"):
            return self.predict(features)

        try:
            probabilities = self.estimator.predict_proba(
                self._prepare_input(features)
            )

            row = probabilities[0]

            if len(row) == 1:
                score = float(row[0])
            else:
                score = float(row[-1])

            score = max(0.0, min(1.0, score))

            probability_map = {
                str(index): float(value)
                for index, value in enumerate(row)
            }

            return ModelPrediction(
                score=score,
                probabilities=probability_map,
                status="ok",
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[f"Model probability inference failed: {exc}"],
            )

    def predict(
        self,
        features: Sequence[float],
    ) -> ModelPrediction:
        """Run generic model inference."""

        if self.estimator is None:
            return ModelPrediction(
                score=None,
                status="model_not_loaded",
                warnings=["No trained landslide model is loaded."],
            )

        try:
            if hasattr(self.estimator, "predict_proba"):
                return self.predict_proba(features)

            if not hasattr(self.estimator, "predict"):
                return ModelPrediction(
                    score=None,
                    status="unsupported_model",
                    warnings=[
                        "Estimator exposes neither predict_proba nor predict."
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
                score = max(0.0, min(1.0, score))

            return ModelPrediction(
                score=score,
                label=label,
                status="ok",
                warnings=(
                    []
                    if score is not None
                    else [
                        "Estimator returned a class label rather than "
                        "a probability score."
                    ]
                ),
            )

        except Exception as exc:
            return ModelPrediction(
                score=None,
                status="prediction_error",
                warnings=[f"Model inference failed: {exc}"],
            )

    def feature_importance(
        self,
    ) -> dict[str, float]:
        """
        Return estimator feature importance when exposed.

        This is intentionally lightweight. SHAP integration belongs in the
        separate explainability layer.
        """

        if self.estimator is None:
            return {}

        importance = getattr(
            self.estimator,
            "feature_importances_",
            None,
        )

        if importance is None:
            return {}

        names = self.feature_names

        if not names:
            names = tuple(
                f"feature_{index}"
                for index in range(len(importance))
            )

        return {
            name: float(value)
            for name, value in zip(names, importance)
        }

    def health(self) -> dict[str, Any]:
        """Return model health information."""

        return {
            "component": "landslide_model",
            "status": "healthy" if self.is_loaded else "not_loaded",
            "loaded": self.is_loaded,
            "trained": self.metadata.trained,
            "calibrated": self.metadata.calibrated,
            "name": self.metadata.name,
            "version": self.metadata.version,
            "model_type": self.metadata.model_type,
            "feature_count": len(self.metadata.feature_names),
        }