"""
Provider-agnostic anomaly detection model wrapper.

Compatible with estimators exposing interfaces such as:
    - predict(X)
    - decision_function(X)
    - score_samples(X)

Typical compatible models include Isolation Forest, One-Class SVM,
Local Outlier Factor variants, and custom anomaly estimators.

No anomaly is fabricated when a model is unavailable.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass
class AnomalyModelMetadata:
    """Metadata describing an anomaly model."""

    name: str = "anomaly-detection-model"
    version: str = "v1"

    model_type: str = "unsupervised_anomaly_detection"
    trained: bool = False

    feature_names: list[str] = field(default_factory=list)

    target: str = "anomaly"
    task: str = "anomaly_detection"

    description: str = (
        "Detects observations that differ significantly from "
        "the learned/reference normal operating pattern."
    )

    training_dataset: Optional[str] = None
    training_date: Optional[str] = None

    notes: list[str] = field(
        default_factory=lambda: [
            "An anomaly is not automatically a disaster.",
            "Anomaly scores require domain interpretation.",
            "Sensor faults and genuine hazards can both create anomalies.",
        ]
    )


@dataclass
class AnomalyPrediction:
    """Raw anomaly-model output."""

    is_anomaly: Optional[bool]
    anomaly_score: Optional[float]

    model_name: str
    model_version: str

    timestamp: str

    raw_prediction: Any = None
    raw_score: Any = None

    warnings: list[str] = field(
        default_factory=list
    )


class AnomalyModel:
    """
    Wrapper around a generic anomaly detector.

    Supported estimator interfaces:

        predict(X)
        decision_function(X)
        score_samples(X)

    The wrapper intentionally does not assume a particular ML library.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[
            AnomalyModelMetadata
        ] = None,
    ) -> None:
        self.estimator = estimator

        self.metadata = (
            metadata
            or AnomalyModelMetadata()
        )

    @property
    def is_loaded(self) -> bool:
        return self.estimator is not None

    def predict_label(
        self,
        features: Sequence[float],
    ) -> Optional[bool]:
        """
        Return anomaly label when the estimator provides predict().

        Convention:
            -1 = anomaly
             1 = normal

        For estimators using a different convention, the wrapper may need
        to be adapted.
        """

        if self.estimator is None:
            raise RuntimeError(
                "Anomaly model is not loaded."
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
            value = int(output[0])
        except (
            IndexError,
            TypeError,
            ValueError,
        ):
            return None

        if value == -1:
            return True

        if value == 1:
            return False

        return None

    def score(
        self,
        features: Sequence[float],
    ) -> Optional[float]:
        """
        Return raw anomaly score when available.

        decision_function() is preferred because many anomaly estimators
        expose it as their primary anomaly score.
        """

        if self.estimator is None:
            raise RuntimeError(
                "Anomaly model is not loaded."
            )

        output = None

        if hasattr(
            self.estimator,
            "decision_function",
        ):
            output = (
                self.estimator.decision_function(
                    [list(features)]
                )
            )

        elif hasattr(
            self.estimator,
            "score_samples",
        ):
            output = (
                self.estimator.score_samples(
                    [list(features)]
                )
            )

        if output is None:
            return None

        try:
            return float(output[0])
        except (
            IndexError,
            TypeError,
            ValueError,
        ):
            return None

    def predict_result(
        self,
        features: Sequence[float],
    ) -> AnomalyPrediction:
        """Return a structured anomaly prediction."""

        warnings: list[str] = []

        label: Optional[bool] = None
        score: Optional[float] = None

        try:
            label = self.predict_label(
                features
            )
        except (
            RuntimeError,
            ValueError,
        ) as exc:
            warnings.append(str(exc))

        try:
            score = self.score(
                features
            )
        except (
            RuntimeError,
            ValueError,
        ) as exc:
            warnings.append(str(exc))

        if label is None:
            warnings.append(
                "Estimator did not provide a supported anomaly label."
            )

        if score is None:
            warnings.append(
                "Estimator did not provide a supported anomaly score."
            )

        return AnomalyPrediction(
            is_anomaly=label,
            anomaly_score=score,
            model_name=self.metadata.name,
            model_version=self.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            raw_prediction=label,
            raw_score=score,
            warnings=warnings,
        )

    def health(self) -> dict[str, Any]:
        """Return model health information."""

        return {
            "loaded": self.is_loaded,
            "trained": self.metadata.trained,
            "model_name": self.metadata.name,
            "model_version": self.metadata.version,
            "model_type": self.metadata.model_type,
            "task": self.metadata.task,
            "feature_count": len(
                self.metadata.feature_names
            ),
        }

    def save(
        self,
        model_path: str | Path,
        metadata_path: Optional[
            str | Path
        ] = None,
    ) -> None:
        """Save anomaly estimator and metadata."""

        if self.estimator is None:
            raise RuntimeError(
                "Cannot save an unloaded anomaly model."
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
            metadata_path = model_path.with_suffix(
                ".json"
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
    ) -> "AnomalyModel":
        """Load anomaly model from disk."""

        model_path = Path(model_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Anomaly model not found: {model_path}"
            )

        with model_path.open("rb") as file:
            estimator = pickle.load(file)

        if metadata_path is None:
            metadata_path = model_path.with_suffix(
                ".json"
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
                    AnomalyModelMetadata(
                        **json.load(file)
                    )
                )

        if metadata is None:
            metadata = AnomalyModelMetadata(
                trained=True
            )

        return cls(
            estimator=estimator,
            metadata=metadata,
        )