"""
Model accuracy and performance monitoring.

Supports:
- Classification metrics
- Regression metrics
- Probability calibration metrics
- Confusion matrix

Metrics are intentionally implemented without forcing
scikit-learn as a runtime dependency.
"""

from __future__ import annotations

import math
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List


@dataclass
class ClassificationMetrics:
    accuracy: float
    precision: float
    recall: float
    f1: float
    specificity: float
    false_positive_rate: float
    false_negative_rate: float
    brier_score: float


@dataclass
class RegressionMetrics:
    mae: float
    mse: float
    rmse: float
    mean_error: float


class AccuracyMonitor:
    """
    Calculate and track model performance.
    """

    def __init__(self):
        self.history = defaultdict(list)

    # ---------------------------------------------------------
    # Classification
    # ---------------------------------------------------------

    @staticmethod
    def classification_metrics(
        y_true: List[int],
        y_pred: List[int],
        probabilities: List[float] | None = None,
    ) -> ClassificationMetrics:

        if len(y_true) != len(y_pred):
            raise ValueError(
                "y_true and y_pred must "
                "have the same length."
            )

        if not y_true:
            raise ValueError(
                "Input arrays cannot be empty."
            )

        tp = 0
        tn = 0
        fp = 0
        fn = 0

        for actual, predicted in zip(
            y_true,
            y_pred,
        ):

            if actual == 1 and predicted == 1:
                tp += 1

            elif actual == 0 and predicted == 0:
                tn += 1

            elif actual == 0 and predicted == 1:
                fp += 1

            elif actual == 1 and predicted == 0:
                fn += 1

        total = (
            tp + tn + fp + fn
        )

        accuracy = (
            (tp + tn) / total
            if total
            else 0.0
        )

        precision = (
            tp / (tp + fp)
            if tp + fp
            else 0.0
        )

        recall = (
            tp / (tp + fn)
            if tp + fn
            else 0.0
        )

        f1 = (
            2 * precision * recall
            / (precision + recall)
            if precision + recall
            else 0.0
        )

        specificity = (
            tn / (tn + fp)
            if tn + fp
            else 0.0
        )

        false_positive_rate = (
            fp / (fp + tn)
            if fp + tn
            else 0.0
        )

        false_negative_rate = (
            fn / (fn + tp)
            if fn + tp
            else 0.0
        )

        brier_score = 0.0

        if probabilities is not None:

            if len(probabilities) != len(y_true):
                raise ValueError(
                    "probabilities and y_true "
                    "must have the same length."
                )

            brier_score = sum(
                (
                    probability
                    - actual
                ) ** 2
                for probability, actual
                in zip(
                    probabilities,
                    y_true,
                )
            ) / len(y_true)

        return ClassificationMetrics(
            accuracy=round(
                accuracy,
                6,
            ),
            precision=round(
                precision,
                6,
            ),
            recall=round(
                recall,
                6,
            ),
            f1=round(
                f1,
                6,
            ),
            specificity=round(
                specificity,
                6,
            ),
            false_positive_rate=round(
                false_positive_rate,
                6,
            ),
            false_negative_rate=round(
                false_negative_rate,
                6,
            ),
            brier_score=round(
                brier_score,
                6,
            ),
        )

    # ---------------------------------------------------------
    # Regression
    # ---------------------------------------------------------

    @staticmethod
    def regression_metrics(
        y_true: List[float],
        y_pred: List[float],
    ) -> RegressionMetrics:

        if len(y_true) != len(y_pred):
            raise ValueError(
                "y_true and y_pred must "
                "have the same length."
            )

        if not y_true:
            raise ValueError(
                "Input arrays cannot be empty."
            )

        errors = [
            predicted - actual
            for actual, predicted
            in zip(
                y_true,
                y_pred,
            )
        ]

        absolute_errors = [
            abs(error)
            for error in errors
        ]

        squared_errors = [
            error ** 2
            for error in errors
        ]

        mae = sum(
            absolute_errors
        ) / len(errors)

        mse = sum(
            squared_errors
        ) / len(errors)

        rmse = math.sqrt(mse)

        mean_error = sum(
            errors
        ) / len(errors)

        return RegressionMetrics(
            mae=round(mae, 6),
            mse=round(mse, 6),
            rmse=round(rmse, 6),
            mean_error=round(
                mean_error,
                6,
            ),
        )

    # ---------------------------------------------------------
    # Record classification metrics
    # ---------------------------------------------------------

    def record_classification(
        self,
        model_name: str,
        y_true: List[int],
        y_pred: List[int],
        probabilities: List[float] | None = None,
    ) -> ClassificationMetrics:

        metrics = self.classification_metrics(
            y_true,
            y_pred,
            probabilities,
        )

        self.history[
            model_name
        ].append(
            {
                "timestamp": datetime.now(
                    timezone.utc
                ).isoformat(),
                "type": "classification",
                "metrics": metrics.__dict__,
            }
        )

        return metrics

    # ---------------------------------------------------------
    # Record regression metrics
    # ---------------------------------------------------------

    def record_regression(
        self,
        model_name: str,
        y_true: List[float],
        y_pred: List[float],
    ) -> RegressionMetrics:

        metrics = self.regression_metrics(
            y_true,
            y_pred,
        )

        self.history[
            model_name
        ].append(
            {
                "timestamp": datetime.now(
                    timezone.utc
                ).isoformat(),
                "type": "regression",
                "metrics": metrics.__dict__,
            }
        )

        return metrics

    # ---------------------------------------------------------
    # History
    # ---------------------------------------------------------

    def get_history(
        self,
        model_name: str,
    ) -> List[Dict]:

        return self.history.get(
            model_name,
            [],
        )

    # ---------------------------------------------------------
    # Health
    # ---------------------------------------------------------

    def health(self) -> Dict:

        return {
            "status": "healthy",
            "models_tracked": len(
                self.history
            ),
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
        }