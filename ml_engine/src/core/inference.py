"""Base inference engine executing batched and real-time model predictions."""
from __future__ import annotations

from typing import Any
import pandas as pd
import numpy as np
from .base_model import BaseModel
from .prediction import PredictionResult
from .exceptions import InferenceError


class BaseInferenceEngine:
    """Encapsulates pre-inference validation, execution, and post-inference calibration."""

    def __init__(self, model: BaseModel) -> None:
        self.model = model

    def predict_one(self, sample: dict[str, Any] | pd.Series) -> PredictionResult:
        """Run inference on a single sample."""
        try:
            return self.model.predict(sample)
        except Exception as e:
            raise InferenceError(f"Inference error for {self.model.config.model_name}: {e}") from e

    def predict_batch(self, batch: pd.DataFrame | list[dict[str, Any]]) -> list[PredictionResult]:
        """Run batched inference."""
        if isinstance(batch, pd.DataFrame):
            records = batch.to_dict(orient="records")
        else:
            records = batch
        return [self.predict_one(row) for row in records]
