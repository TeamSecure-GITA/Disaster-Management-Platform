from __future__ import annotations

import numpy as np


class ForecastingEvaluator:
    """Evaluates time series forecasting with specialized hydrological and meteorological metrics."""

    @staticmethod
    def smape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Symmetric Mean Absolute Percentage Error."""
        denominator = (np.abs(y_true) + np.abs(y_pred)) / 2.0
        diff = np.abs(y_pred - y_true) / np.where(denominator == 0, 1.0, denominator)
        return float(np.mean(diff) * 100.0)

    @staticmethod
    def mean_directional_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Percentage of correct direction changes (up/down)."""
        if len(y_true) < 2:
            return 100.0
        true_diff = np.diff(y_true)
        pred_diff = np.diff(y_pred)
        correct_directions = (true_diff * pred_diff) > 0
        return float(np.mean(correct_directions) * 100.0)

    @staticmethod
    def peak_timing_and_magnitude_error(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, float]:
        """Evaluates how accurately peak flood or storm levels and arrival times were forecasted."""
        true_peak_idx = int(np.argmax(y_true))
        pred_peak_idx = int(np.argmax(y_pred))
        true_peak_val = float(y_true[true_peak_idx])
        pred_peak_val = float(y_pred[pred_peak_idx])

        return {
            "peak_magnitude_error": abs(pred_peak_val - true_peak_val),
            "peak_time_lag_steps": float(pred_peak_idx - true_peak_idx),
            "true_peak": true_peak_val,
            "pred_peak": pred_peak_val,
        }

    def evaluate(self, y_true: list[float] | np.ndarray, y_pred: list[float] | np.ndarray) -> dict[str, float]:
        yt = np.array(y_true, dtype=float)
        yp = np.array(y_pred, dtype=float)

        mae = float(np.mean(np.abs(yp - yt)))
        rmse = float(np.sqrt(np.mean((yp - yt) ** 2)))
        smape_val = self.smape(yt, yp)
        mda_val = self.mean_directional_accuracy(yt, yp)
        peak_metrics = self.peak_timing_and_magnitude_error(yt, yp)

        return {
            "mae": mae,
            "rmse": rmse,
            "smape": smape_val,
            "directional_accuracy_pct": mda_val,
            **peak_metrics,
        }
