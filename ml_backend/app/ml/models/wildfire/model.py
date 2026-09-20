"""
Provider-agnostic wildfire risk model wrapper.

The wrapper can work with sklearn-like estimators without requiring
scikit-learn to be installed.

Supported estimator interfaces:
    - predict_proba(X)
    - predict(X)
    - feature_importances_

Model outputs represent wildfire hazard/risk estimation from supplied
features. They are NOT deterministic predictions of future fires.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass
class WildfireModelMetadata:
    """Metadata describing a trained wildfire model."""

    name: str = "wildfire-risk-model"
    version: str = "v1"
    model_type: str = "classification"
    trained: bool = False
    calibrated: bool = False

    feature_names: list[str] = field(default_factory=list)

    target: str = "wildfire_hazard_probability"
    task: str = "risk_estimation"

    description: str = (
        "Estimates wildfire hazard/risk from environmental, "
        "vegetation, terrain, weather and observed-fire indicators."
    )

    training_dataset: Optional[str] = None
    training_date: Optional[str] = None
    notes: list[str] = field(
        default_factory=lambda: [
            "This is a hazard/risk estimation model.",
            "It does not deterministically predict future wildfire occurrence.",
            "Hotspot and thermal-anomaly values are treated as supplied observations.",
        ]
    )


@dataclass
class WildfireModelPrediction:
    """Raw prediction returned by the model wrapper."""

    probability: Optional[float]
    predicted_class: Optional[int]

    model_name: str
    model_version: str

    timestamp: str

    raw_output: Any = None
    warnings: list[str] = field(default_factory=list)


class WildfireModel:
    """
    Wrapper around an optional sklearn-like wildfire estimator.

    The estimator is expected to implement one or more of:

        predict_proba(X)
        predict(X)
        feature_importances_

    No heuristic prediction is generated when an estimator is unavailable.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[WildfireModelMetadata] = None,
    ) -> None:
        self.estimator = estimator

        self.metadata = metadata or WildfireModelMetadata()

        if not self.metadata.feature_names:
            try:
                from .features import WILDFIRE_FEATURE_NAMES

                self.metadata.feature_names = list(WILDFIRE_FEATURE_NAMES)
            except Exception:
                pass

    @property
    def is_loaded(self) -> bool:
        """Return whether a trained estimator is currently loaded."""

        return self.estimator is not None

    def predict_proba(
        self,
        features: Sequence[float],
    ) -> float:
        """
        Return positive-class probability.

        Raises:
            RuntimeError: if no estimator is loaded.
            ValueError: if estimator output is invalid.
        """

        if self.estimator is None:
            raise RuntimeError("Wildfire model is not loaded.")

        if not hasattr(self.estimator, "predict_proba"):
            raise ValueError(
                "Loaded wildfire estimator does not implement predict_proba()."
            )

        output = self.estimator.predict_proba([list(features)])

        if output is None:
            raise ValueError("Estimator returned no probability output.")

        # Typical sklearn output:
        # [[probability_class_0, probability_class_1]]
        try:
            row = output[0]
        except (IndexError, TypeError):
            raise ValueError("Invalid predict_proba() output.")

        if len(row) < 2:
            raise ValueError(
                "Binary wildfire classifier must return at least two probabilities."
            )

        probability = float(row[1])

        if not 0.0 <= probability <= 1.0:
            raise ValueError(
                f"Model returned invalid probability: {probability}"
            )

        return probability

    def predict(
        self,
        features: Sequence[float],
    ) -> Optional[int]:
        """Return the predicted class when supported."""

        if self.estimator is None:
            raise RuntimeError("Wildfire model is not loaded.")

        if not hasattr(self.estimator, "predict"):
            return None

        output = self.estimator.predict([list(features)])

        if output is None:
            return None

        try:
            return int(output[0])
        except (IndexError, TypeError, ValueError):
            return None

    def predict_result(
        self,
        features: Sequence[float],
    ) -> WildfireModelPrediction:
        """Return a structured raw model prediction."""

        timestamp = datetime.now(timezone.utc).isoformat()

        probability: Optional[float] = None
        predicted_class: Optional[int] = None
        warnings: list[str] = []

        probability_error: Optional[str] = None

        try:
            probability = self.predict_proba(features)
        except (RuntimeError, ValueError) as exc:
            probability_error = str(exc)

        try:
            predicted_class = self.predict(features)
        except (RuntimeError, ValueError) as exc:
            warnings.append(str(exc))

        if probability is None and probability_error:
            warnings.append(probability_error)

        return WildfireModelPrediction(
            probability=probability,
            predicted_class=predicted_class,
            model_name=self.metadata.name,
            model_version=self.metadata.version,
            timestamp=timestamp,
            warnings=warnings,
        )

    def feature_importance(self) -> dict[str, float]:
        """
        Return estimator feature importance when available.

        Empty dictionary means the underlying estimator does not expose
        feature importance.
        """

        if self.estimator is None:
            return {}

        if not hasattr(self.estimator, "feature_importances_"):
            return {}

        try:
            values = list(self.estimator.feature_importances_)
        except Exception:
            return {}

        names = self.metadata.feature_names

        return {
            names[index] if index < len(names) else f"feature_{index}": float(
                value
            )
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
            "feature_count": len(self.metadata.feature_names),
            "deterministic_prediction": False,
        }

    def save(
        self,
        model_path: str | Path,
        metadata_path: Optional[str | Path] = None,
    ) -> None:
        """Save estimator and metadata."""

        if self.estimator is None:
            raise RuntimeError("Cannot save an unloaded wildfire model.")

        model_path = Path(model_path)
        model_path.parent.mkdir(parents=True, exist_ok=True)

        with model_path.open("wb") as file:
            pickle.dump(self.estimator, file)

        if metadata_path is None:
            metadata_path = model_path.with_suffix(".json")

        metadata_path = Path(metadata_path)
        metadata_path.parent.mkdir(parents=True, exist_ok=True)

        with metadata_path.open("w", encoding="utf-8") as file:
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
    ) -> "WildfireModel":
        """Load estimator and metadata from disk."""

        model_path = Path(model_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Wildfire model file not found: {model_path}"
            )

        with model_path.open("rb") as file:
            estimator = pickle.load(file)

        metadata: Optional[WildfireModelMetadata] = None

        if metadata_path is None:
            metadata_path = model_path.with_suffix(".json")

        metadata_path = Path(metadata_path)

        if metadata_path.exists():
            with metadata_path.open("r", encoding="utf-8") as file:
                raw_metadata = json.load(file)

            metadata = WildfireModelMetadata(**raw_metadata)

        if metadata is None:
            metadata = WildfireModelMetadata(trained=True)

        return cls(
            estimator=estimator,
            metadata=metadata,
        )