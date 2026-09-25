from __future__ import annotations

import numpy as np
from scipy.optimize import minimize_scalar


class TemperatureScaler:
    """Post-processing calibration via Temperature Scaling for probabilistic classification."""

    def __init__(self, initial_temperature: float = 1.0) -> None:
        self.temperature: float = initial_temperature
        self.is_fitted: bool = False

    @staticmethod
    def _nll_loss(temperature: float, logits: np.ndarray, targets: np.ndarray) -> float:
        """Negative log-likelihood loss for binary classification under temperature T."""
        if temperature <= 0.01:
            return 1e9

        scaled_logits = logits / temperature
        # Numerically stable binary cross entropy
        # loss = max(x, 0) - x * y + log(1 + exp(-abs(x)))
        loss = (
            np.maximum(scaled_logits, 0)
            - scaled_logits * targets
            + np.log1p(np.exp(-np.abs(scaled_logits)))
        )
        return float(np.mean(loss))

    def fit(self, logits: list[float] | np.ndarray, y_true: list[int] | np.ndarray) -> TemperatureScaler:
        """Find optimal temperature T minimizing NLL."""
        z = np.array(logits, dtype=float)
        y = np.array(y_true, dtype=int)

        res = minimize_scalar(
            self._nll_loss,
            bounds=(0.05, 10.0),
            method="bounded",
            args=(z, y),
        )

        self.temperature = float(res.x)
        self.is_fitted = True
        return self

    def scale_probabilities(self, probabilities: list[float] | np.ndarray) -> np.ndarray:
        """Scale probability predictions using learned temperature."""
        probs = np.array(probabilities, dtype=float).clip(1e-7, 1.0 - 1e-7)
        logits = np.log(probs / (1.0 - probs))

        scaled_logits = logits / self.temperature
        # Sigmoid
        return 1.0 / (1.0 + np.exp(-scaled_logits))
