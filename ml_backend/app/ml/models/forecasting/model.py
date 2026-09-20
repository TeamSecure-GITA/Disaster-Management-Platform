"""
Provider-agnostic forecasting model wrapper.

Supported estimator styles include models exposing:

    predict(X)
    predict_interval(X)

The wrapper can also work with callable/custom forecasting objects.

No forecast is fabricated when a model is unavailable.
"""

from __future__ import annotations

import json
import pickle
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional, Sequence


@dataclass
class ForecastModelMetadata:
    """Metadata describing a forecasting model."""

    name: str = "environmental-forecast-model"
    version: str = "v1"

    model_type: str = "time_series_forecasting"
    trained: bool = False

    feature_names: list[str] = field(
        default_factory=list
    )

    target: str = "target_value"
    task: str = "forecasting"

    forecast_horizon_steps: int = 1

    calibrated: bool = False

    description: str = (
        "Forecasts a future environmental or disaster-related "
        "time-series variable from historical observations."
    )

    training_dataset: Optional[str] = None
    training_date: Optional[str] = None

    notes: list[str] = field(
        default_factory=lambda: [
            "Forecasts represent model estimates, not guarantees.",
            "Forecast uncertainty should be retained.",
            "Forecast accuracy depends on data quality and horizon.",
        ]
    )


@dataclass
class ForecastPrediction:
    """Raw forecast result."""

    values: list[float]

    lower_bounds: Optional[list[float]]

    upper_bounds: Optional[list[float]]

    model_name: str
    model_version: str

    timestamp: str

    raw_output: Any = None

    warnings: list[str] = field(
        default_factory=list
    )


class ForecastModel:
    """
    Generic forecasting model wrapper.

    Supported estimator interfaces:

        predict(X)
        forecast(X)
        predict_interval(X)

    A custom estimator can therefore be plugged in without making
    the rest of the backend depend on a specific ML framework.
    """

    def __init__(
        self,
        estimator: Any = None,
        metadata: Optional[
            ForecastModelMetadata
        ] = None,
    ) -> None:
        self.estimator = estimator

        self.metadata = (
            metadata
            or ForecastModelMetadata()
        )

    @property
    def is_loaded(self) -> bool:
        return self.estimator is not None

    @staticmethod
    def _normalize_output(
        output: Any,
    ) -> list[float]:
        """Normalize common forecasting outputs."""

        if output is None:
            raise ValueError(
                "Forecast model returned no output."
            )

        # numpy-like arrays
        if hasattr(output, "tolist"):
            output = output.tolist()

        # Nested single-series output
        if (
            isinstance(output, list)
            and output
            and isinstance(output[0], (list, tuple))
        ):
            output = output[0]

        if not isinstance(
            output,
            (list, tuple),
        ):
            output = [output]

        values: list[float] = []

        for value in output:
            try:
                values.append(float(value))
            except (
                TypeError,
                ValueError,
            ) as exc:
                raise ValueError(
                    "Forecast output contains a non-numeric value."
                ) from exc

        return values

    def predict(
        self,
        features: Sequence[float],
    ) -> list[float]:
        """Generate a forecast."""

        if self.estimator is None:
            raise RuntimeError(
                "Forecast model is not loaded."
            )

        if hasattr(
            self.estimator,
            "predict",
        ):
            output = self.estimator.predict(
                [list(features)]
            )

        elif hasattr(
            self.estimator,
            "forecast",
        ):
            output = self.estimator.forecast(
                [list(features)]
            )

        elif callable(self.estimator):
            output = self.estimator(
                list(features)
            )

        else:
            raise ValueError(
                "Forecast estimator does not expose "
                "predict(), forecast(), or callable()."
            )

        values = self._normalize_output(
            output
        )

        if not values:
            raise ValueError(
                "Forecast model returned an empty forecast."
            )

        return values

    def predict_interval(
        self,
        features: Sequence[float],
    ) -> tuple[
        Optional[list[float]],
        Optional[list[float]],
    ]:
        """Return prediction interval when supported."""

        if self.estimator is None:
            raise RuntimeError(
                "Forecast model is not loaded."
            )

        if not hasattr(
            self.estimator,
            "predict_interval",
        ):
            return None, None

        output = (
            self.estimator.predict_interval(
                [list(features)]
            )
        )

        if output is None:
            return None, None

        if not isinstance(
            output,
            (tuple, list),
        ) or len(output) != 2:
            raise ValueError(
                "predict_interval() must return "
                "(lower, upper)."
            )

        lower = self._normalize_output(
            output[0]
        )

        upper = self._normalize_output(
            output[1]
        )

        return lower, upper

    def predict_result(
        self,
        features: Sequence[float],
    ) -> ForecastPrediction:
        """Return structured forecast output."""

        warnings: list[str] = []

        values: list[float] = []

        lower: Optional[list[float]] = None
        upper: Optional[list[float]] = None

        try:
            values = self.predict(
                features
            )
        except (
            RuntimeError,
            ValueError,
        ) as exc:
            warnings.append(str(exc))

        if values:
            try:
                lower, upper = (
                    self.predict_interval(
                        features
                    )
                )
            except (
                RuntimeError,
                ValueError,
            ) as exc:
                warnings.append(
                    f"Prediction interval unavailable: {exc}"
                )

        if values and (
            lower is None
            or upper is None
        ):
            warnings.append(
                "No calibrated prediction interval was provided."
            )

        return ForecastPrediction(
            values=values,
            lower_bounds=lower,
            upper_bounds=upper,
            model_name=self.metadata.name,
            model_version=self.metadata.version,
            timestamp=datetime.now(
                timezone.utc
            ).isoformat(),
            raw_output=values,
            warnings=warnings,
        )

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
            "target": self.metadata.target,
            "forecast_horizon_steps": (
                self.metadata.forecast_horizon_steps
            ),
        }

    def save(
        self,
        model_path: str | Path,
        metadata_path: Optional[
            str | Path
        ] = None,
    ) -> None:
        """Save forecasting model."""

        if self.estimator is None:
            raise RuntimeError(
                "Cannot save an unloaded forecast model."
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
                model_path.with_suffix(".json")
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
    ) -> "ForecastModel":
        """Load forecasting model."""

        model_path = Path(model_path)

        if not model_path.exists():
            raise FileNotFoundError(
                f"Forecast model not found: {model_path}"
            )

        with model_path.open("rb") as file:
            estimator = pickle.load(file)

        if metadata_path is None:
            metadata_path = (
                model_path.with_suffix(".json")
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
                    ForecastModelMetadata(
                        **json.load(file)
                    )
                )

        if metadata is None:
            metadata = ForecastModelMetadata(
                trained=True
            )

        return cls(
            estimator=estimator,
            metadata=metadata,
        )