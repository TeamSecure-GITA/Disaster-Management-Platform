"""
Provider-agnostic multi-hazard model wrapper.

The model can consume a feature vector containing outputs or indicators
from multiple hazard models.

No missing hazard is automatically assigned a risk score.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass
class MultiHazardModelMetadata:
    """Metadata for a multi-hazard model."""

    name: str = "multi-hazard-risk-model"
    version: str = "v1"
    model_type: str = "classification"
    trained: bool = False
    calibrated: bool = False

    feature_names: list[str] = field(default_factory=list)

    target: str = "multi_hazard_risk_probability"
    task: str = "multi_hazard_risk_estimation"

    description: str = (
        "Combines validated hazard indicators and model outputs "
        "to estimate overall multi-hazard risk."
    )

    training_dataset: Optional[str] = None
    training_date: Optional[str] = None

    notes: list[str] = field(
        default_factory=lambda: [
            "Multi-hazard aggregation does not imply deterministic prediction.",
            "Missing hazard outputs are not replaced with fabricated values.",
            "Individual hazard model uncertainty should be retained.",
        ]
    )


@dataclass
class MultiHazardPrediction:
    """Raw model prediction."""

    probability: Optional[float]
    predicted_class: Optional[int]

    model_name: str
    model_version: str

    timestamp: str

    raw_output: Any = None
    warnings: list[str] = field(default_factory=list)


class MultiHazardModel:
    """
    Wrapper around an sklearn-like estimator.

    Supported interfaces:

        predict_proba(X)
        predict(X)
        feature_importances_

    The estimator remains optional so the backend can operate safely
    before a trained model is installed.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[MultiHazardModelMetadata] = None,
    ) -> None:
        self.estimator = estimator
        self.metadata = (
            metadata or MultiHazardModelMetadata()
        )

    @property
    def is_loaded(self) -> bool:
        """Whether an estimator is loaded."""

        return self.estimator is not None

    def predict_proba(
        self,
        features: Sequence[float],
    ) -> float:
        """Return the positive-class probability."""

        if self.estimator is None:
            raise RuntimeError(
                "Multi-hazard model is not loaded."
            )

        if not hasattr(self.estimator, "predict_proba"):
            raise ValueError(
                "Estimator does not implement predict_proba()."
            )

        output = self.estimator.predict_proba(
            [list(features)]
        )

        try:
            row = output[0]
        except (IndexError, TypeError):
            raise ValueError(
                "Invalid predict_proba() output."
            )

        if len(row) < 2:
            raise ValueError(
                "Binary classifier must provide two class probabilities."
            )

        probability = float(row[1])

        if not 0.0 <= probability <= 1.0:
            raise ValueError(
                f"Invalid model probability: {probability}"
            )

        return probability

    def predict(
        self,
        features: Sequence[float],
    ) -> Optional[int]:
        """Return predicted class when supported."""

        if self.estimator is None:
            raise RuntimeError(
                "Multi-hazard model is not loaded."
            )

        if not hasattr(self.estimator, "predict"):
            return None

        output = self.estimator.predict(
            [list(features)]
        )

        try:
            return int(output[0])
        except (IndexError, TypeError, ValueError):
            return None

    def predict_result(
        self,
        features: Sequence[float],
    ) -> MultiHazardPrediction:
        """Return a structured prediction."""

        from datetime import datetime, timezone

        warnings: list[str] = []

        probability: Optional[float] = None
        predicted_class: Optional[int] = None

        try:
            probability = self.predict_proba(features)
        except (RuntimeError, ValueError) as exc:
            warnings.append(str(exc))

        try:
            predicted_class = self.predict(features)
        except (RuntimeError, ValueError) as exc:
            warnings.append(str(exc))

        return MultiHazardPrediction(
            probability=probability,
            predicted_class=predicted_class,
            model_name=self.metadata.name,
            model_version=self.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            warnings=warnings,
        )

    def feature_importance(self) -> dict[str, float]:
        """Return estimator feature importance when available."""

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
                if index < len(self.metadata.feature_names)
                else f"feature_{index}"
            ): float(value)
            for index, value in enumerate(values)
        }

    def health(self) -> dict[str, Any]:
        """Return model health information."""

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
            "deterministic_prediction": False,
        }

    def save(
        self,
        model_path: str | Path,
        metadata_path: Optional[str | Path] = None,
    ) -> None:
        """Save estimator and metadata."""

        if self.estimator is None:
            raise RuntimeError(
                "Cannot save an unloaded multi-hazard model."
            )

        model_path = Path(model_path)
        model_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with model_path.open("wb") as file:
            pickle.dump(self.estimator, file)

        if metadata_path is None:
            metadata_path = model_path.with_suffix(
                ".json"
            )

        metadata_path = Path(metadata_path)
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
        metadata_path: Optional[str | Path] = None,
    ) -> "MultiHazardModel":
        """Load model and metadata from disk."""

        model_path = Path(model_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Multi-hazard model not found: {model_path}"
            )

        with model_path.open("rb") as file:
            estimator = pickle.load(file)

        if metadata_path is None:
            metadata_path = model_path.with_suffix(
                ".json"
            )

        metadata_path = Path(metadata_path)

        metadata: Optional[
            MultiHazardModelMetadata
        ] = None

        if metadata_path.exists():
            with metadata_path.open(
                "r",
                encoding="utf-8",
            ) as file:
                metadata = MultiHazardModelMetadata(
                    **json.load(file)
                )

        if metadata is None:
            metadata = MultiHazardModelMetadata(
                trained=True
            )

        return cls(
            estimator=estimator,
            metadata=metadata,
        )