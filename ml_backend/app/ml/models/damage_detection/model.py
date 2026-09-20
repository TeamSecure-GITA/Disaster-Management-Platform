"""
Provider-agnostic damage detection model wrapper.

The estimator may be:
- A traditional ML classifier
- A feature-based computer-vision classifier
- A neural-network adapter
- A custom inference provider

Expected interfaces:
    predict(X)
    predict_proba(X)
    feature_importances_

This module does not itself inspect images.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass
class DamageDetectionModelMetadata:
    """Metadata describing a damage assessment model."""

    name: str = "disaster-damage-detection-model"
    version: str = "v1"

    model_type: str = "classification"
    trained: bool = False
    calibrated: bool = False

    feature_names: list[str] = field(
        default_factory=list
    )

    target: str = "damage_class"
    task: str = "damage_assessment"

    classes: list[str] = field(
        default_factory=lambda: [
            "no_damage",
            "minor",
            "moderate",
            "severe",
            "destroyed",
        ]
    )

    description: str = (
        "Classifies supplied disaster-damage indicators "
        "into structured damage categories."
    )

    training_dataset: Optional[str] = None
    training_date: Optional[str] = None

    notes: list[str] = field(
        default_factory=lambda: [
            "Assessment quality depends on imagery and feature quality.",
            "Model output is not a substitute for field verification.",
            "Damage classification should preserve uncertainty.",
        ]
    )


@dataclass
class DamageDetectionPrediction:
    """Raw model prediction."""

    predicted_class: Optional[str]

    class_probabilities: dict[str, float]

    confidence: Optional[float]

    model_name: str
    model_version: str

    timestamp: str

    raw_prediction: Any = None

    warnings: list[str] = field(
        default_factory=list
    )


class DamageDetectionModel:
    """
    Wrapper around a generic classification estimator.

    Supported interfaces:

        predict(X)
        predict_proba(X)
        feature_importances_
        classes_

    The wrapper is intentionally independent of a specific ML library.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[
            DamageDetectionModelMetadata
        ] = None,
    ) -> None:
        self.estimator = estimator

        self.metadata = (
            metadata
            or DamageDetectionModelMetadata()
        )

    @property
    def is_loaded(self) -> bool:
        return self.estimator is not None

    def predict_class(
        self,
        features: Sequence[float],
    ) -> Optional[str]:
        """Return the predicted damage class."""

        if self.estimator is None:
            raise RuntimeError(
                "Damage detection model is not loaded."
            )

        if not hasattr(
            self.estimator,
            "predict",
        ):
            return None

        output = self.estimator.predict(
            [list(features)]
        )

        try:
            value = output[0]
        except (
            IndexError,
            TypeError,
        ):
            return None

        return str(value)

    def predict_proba(
        self,
        features: Sequence[float],
    ) -> dict[str, float]:
        """Return class probabilities."""

        if self.estimator is None:
            raise RuntimeError(
                "Damage detection model is not loaded."
            )

        if not hasattr(
            self.estimator,
            "predict_proba",
        ):
            return {}

        output = self.estimator.predict_proba(
            [list(features)]
        )

        try:
            probabilities = output[0]
        except (
            IndexError,
            TypeError,
        ):
            raise ValueError(
                "Invalid predict_proba() output."
            )

        classes: list[Any] = []

        if hasattr(
            self.estimator,
            "classes_",
        ):
            try:
                classes = list(
                    self.estimator.classes_
                )
            except Exception:
                classes = []

        if not classes:
            classes = list(
                self.metadata.classes
            )

        if len(classes) != len(
            probabilities
        ):
            raise ValueError(
                "Number of classes does not match "
                "probability output."
            )

        result: dict[str, float] = {}

        for label, probability in zip(
            classes,
            probabilities,
        ):
            value = float(probability)

            if not 0.0 <= value <= 1.0:
                raise ValueError(
                    f"Invalid class probability: {value}"
                )

            result[str(label)] = value

        return result

    def predict_result(
        self,
        features: Sequence[float],
    ) -> DamageDetectionPrediction:
        """Return structured damage prediction."""

        warnings: list[str] = []

        predicted_class: Optional[
            str
        ] = None

        probabilities: dict[
            str,
            float,
        ] = {}

        try:
            predicted_class = (
                self.predict_class(
                    features
                )
            )
        except (
            RuntimeError,
            ValueError,
        ) as exc:
            warnings.append(str(exc))

        try:
            probabilities = (
                self.predict_proba(
                    features
                )
            )
        except (
            RuntimeError,
            ValueError,
        ) as exc:
            warnings.append(
                f"Class probabilities unavailable: {exc}"
            )

        confidence: Optional[
            float
        ] = None

        if probabilities:
            confidence = max(
                probabilities.values()
            )

        if predicted_class is None:
            warnings.append(
                "No damage class was returned."
            )

        return DamageDetectionPrediction(
            predicted_class=predicted_class,
            class_probabilities=probabilities,
            confidence=confidence,
            model_name=self.metadata.name,
            model_version=self.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            raw_prediction=predicted_class,
            warnings=warnings,
        )

    def feature_importance(
        self,
    ) -> dict[str, float]:
        """Return feature importance when exposed by estimator."""

        if self.estimator is None:
            return {}

        if not hasattr(
            self.estimator,
            "feature_importances_",
        ):
            return {}

        try:
            values = list(
                self.estimator.feature_importances_
            )
        except Exception:
            return {}

        return {
            (
                self.metadata.feature_names[index]
                if index
                < len(
                    self.metadata.feature_names
                )
                else f"feature_{index}"
            ): float(value)
            for index, value in enumerate(
                values
            )
        }

    def health(self) -> dict[str, Any]:
        """Return model health."""

        return {
            "loaded": self.is_loaded,
            "trained": self.metadata.trained,
            "calibrated": self.metadata.calibrated,
            "model_name": self.metadata.name,
            "model_version": self.metadata.version,
            "model_type": self.metadata.model_type,
            "task": self.metadata.task,
            "feature_count": len(
                self.metadata.feature_names
            ),
            "classes": self.metadata.classes,
        }

    def save(
        self,
        model_path: str | Path,
        metadata_path: Optional[
            str | Path
        ] = None,
    ) -> None:
        """Save estimator and metadata."""

        if self.estimator is None:
            raise RuntimeError(
                "Cannot save an unloaded damage model."
            )

        model_path = Path(model_path)

        model_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with model_path.open("wb") as file:
            pickle.dump(
                self.estimator,
                file,
            )

        if metadata_path is None:
            metadata_path = (
                model_path.with_suffix(
                    ".json"
                )
            )

        metadata_path = Path(
            metadata_path
        )

        metadata_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with metadata_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                asdict(self.metadata),
                file,
                indent=2,
                ensure_ascii=False,
            )

    @classmethod
    def load(
        cls,
        model_path: str | Path,
        metadata_path: Optional[
            str | Path
        ] = None,
    ) -> "DamageDetectionModel":
        """Load damage model from disk."""

        model_path = Path(model_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Damage detection model not found: "
                f"{model_path}"
            )

        with model_path.open(
            "rb"
        ) as file:
            estimator = pickle.load(
                file
            )

        if metadata_path is None:
            metadata_path = (
                model_path.with_suffix(
                    ".json"
                )
            )

        metadata_path = Path(
            metadata_path
        )

        metadata = None

        if metadata_path.exists():
            with metadata_path.open(
                "r",
                encoding="utf-8",
            ) as file:
                metadata = (
                    DamageDetectionModelMetadata(
                        **json.load(file)
                    )
                )

        if metadata is None:
            metadata = (
                DamageDetectionModelMetadata(
                    trained=True
                )
            )

        return cls(
            estimator=estimator,
            metadata=metadata,
        )